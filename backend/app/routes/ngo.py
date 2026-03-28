import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import NGOVerifyRequest, NGOHelpUpdateRequest, success
from app.core.dependencies import get_current_user, require_role
from app.repositories.user_repo import UserRepository
from app.repositories.help_repo import HelpRequestRepository
from app.repositories.document_repo import DocumentRepository
from app.models.models import NGOVerification, HelpRequest, FarmerProfile, User, PesticideScan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ngo", tags=["NGO Module"])

ngo_required = require_role("ngo", "admin")


@router.get("/farmers")
def get_farmers_for_review(
    filter_status: str = Query(
        default="needs_manual_review",
        description="Filter by verification status",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Enriched farmer list with profile details for NGO review."""
    # Using join to get profile info
    query = db.query(User, FarmerProfile).outerjoin(FarmerProfile, User.id == FarmerProfile.user_id)
    query = query.filter(User.verification_status == filter_status)
    
    results = query.all()
    
    out = []
    for user, profile in results:
        # Get AI findings for this farmer's documents
        docs = db.query(Document).filter(Document.user_id == user.id).all()
        ai_findings = [d.ai_notes for d in docs if d.ai_notes]
        
        out.append(
            {
                "user_id": user.id,
                "phone": user.phone,
                "name": profile.name if (profile and profile.name) else (user.name or "Unknown Farmer"),
                "location": f"{profile.village}, {profile.district}" if (profile and profile.village and profile.district) else "Location Not Set",
                "verification_status": user.verification_status,
                "document_count": len(docs),
                "ai_notes": ", ".join(ai_findings), # Flattened notes for the UI
                "created_at": user.created_at.isoformat(),
            }
        )

    return success(f"Found {len(out)} farmer(s) with status '{filter_status}'", out)


@router.post("/verify")
def verify_farmer(
    payload: NGOVerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """NGO approves or rejects a farmer's verification."""
    user_repo = UserRepository(db)
    farmer = user_repo.get_by_id(payload.farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    new_status = "verified" if payload.action == "approve" else "rejected"
    farmer = user_repo.update_verification_status(payload.farmer_id, new_status)

    if payload.action == "approve":
        user_repo.update_ngo_verified(payload.farmer_id, True)

    # Record verification
    record = NGOVerification(
        farmer_id=payload.farmer_id,
        ngo_id=current_user.id,
        action=payload.action,
        notes=payload.notes or "",
    )
    db.add(record)
    db.commit()

    logger.info(f"NGO {current_user.id} {payload.action}d farmer {payload.farmer_id}")

    return success(f"Farmer {payload.action}d successfully", {"new_status": new_status})


@router.get("/help-requests")
def get_help_requests(
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Enriched help request list with farmer details."""
    query = db.query(HelpRequest, User, FarmerProfile).join(User, HelpRequest.user_id == User.id).outerjoin(FarmerProfile, User.id == FarmerProfile.user_id)
    query = query.filter(HelpRequest.status == "open")
    
    items = query.all()

    return success(
        f"Found {len(items)} open help request(s)",
        [
            {
                "id": hr.id,
                "user_id": hr.user_id,
                "farmer_name": profile.name if profile else user.name,
                "location": f"{profile.village}, {profile.district}" if profile else "Unknown",
                "request_type": hr.request_type,
                "description": hr.description,
                "status": hr.status,
                "created_at": hr.created_at.isoformat(),
            }
            for hr, user, profile in items
        ],
    )


@router.post("/help-update")
def update_help_request(
    payload: NGOHelpUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Update a help request status."""
    repo = HelpRequestRepository(db)
    hr = repo.update_status(
        request_id=payload.request_id,
        status=payload.status,
        notes=payload.notes or "",
    )

    if not hr:
        raise HTTPException(status_code=404, detail="Help request not found")

    logger.info(f"Help request {payload.request_id} updated to {payload.status}")
    return success(f"Help request updated to '{payload.status}'", {"hr_id": hr.id})


@router.get("/pending-scans")
def get_pending_scans(
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Get pesticide scans requiring NGO review."""
    query = db.query(PesticideScan, User, FarmerProfile).join(User, PesticideScan.user_id == User.id).outerjoin(FarmerProfile, User.id == FarmerProfile.user_id)
    query = query.filter(PesticideScan.status.in_(["suspicious", "fraud", "fake"]))
    
    items = query.all()

    return success(
        f"Found {len(items)} scans for review",
        [
            {
                "id": s.id,
                "pesticide_name": s.pesticide_name or "Unknown Chemical",
                "farmer_name": profile.name if profile and profile.name else (user.name or "Unknown Farmer"),
                "location": f"{profile.village}, {profile.district}" if (profile and profile.village and profile.district) else "Location Not Set",
                "extracted_mrp": s.extracted_mrp or 0.0,
                "bill_price": s.bill_price or 0.0,
                "status": s.status,
                "ai_findings": s.ai_findings or "No issues found",
                "created_at": s.created_at.isoformat(),
            }
            for s, user, profile in items
        ]
    )


@router.post("/resolve-scan")
def resolve_scan(
    scan_id: str,
    action: str, # clean | fraud
    notes: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Mark a scan as Fraud or Clean."""
    scan = db.query(PesticideScan).filter(PesticideScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.status = action
    scan.ngo_notes = notes
    db.commit()

    return success(f"Scan marked as {action}", {"scan_id": scan_id})


@router.get("/stats")
def get_ngo_stats(
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Get real-time metrics for the NGO dashboard."""
    # Active Cases (Help Requests)
    active_hr = db.query(HelpRequest).filter(HelpRequest.status.in_(["open", "in_progress"])).count()
    
    # Resolved Cases
    resolved_hr = db.query(HelpRequest).filter(HelpRequest.status == "resolved").count()
    
    # Total Farmers Helped (Resolved HR + Approved Verifications)
    verifications = db.query(NGOVerification).filter(NGOVerification.action == "approve").count()
    total_helped = resolved_hr + verifications
    
    # Resolution Rate
    total_hr = db.query(HelpRequest).count()
    resolution_rate = f"{int((resolved_hr / total_hr * 100))}%" if total_hr > 0 else "0%"
    
    # Districts Covered (From NGO Profile)
    from app.repositories.profile_repo import ProfileRepository
    repo = ProfileRepository(db)
    profile = repo.get_by_user_id(current_user.id, "ngo")
    districts_count = 0
    if profile and profile.districts_covered:
        import json
        try:
            districts = json.loads(profile.districts_covered)
            districts_count = len(districts)
        except:
            pass

    return success("NGO metrics fetched", {
        "farmers_helped": total_helped,
        "active_cases": active_hr,
        "resolution_rate": resolution_rate,
        "districts_covered": districts_count
    })

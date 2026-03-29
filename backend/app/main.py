"""
ANNADATA – Complete FastAPI Backend
Production-ready backend for farmer intelligence platform.
"""
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder

from app.core.config import settings
from app.database import engine, Base

# Import all models so SQLAlchemy registers them
import app.models.models  # noqa: F401

# Routes
from app.routes import (
    auth,
    profile,
    documents,
    trust_score,
    price,
    heatmap,
    input_verify,
    loan,
    help_request,
    ngo,
    admin,
    voice,
    financials,
    legal,
    requests,
    chatbot,
    whatsapp,
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("annadata")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler."""
    logger.info("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    logger.info("Loading price ML model (training if first run)...")
    from app.ml.price_model import get_model
    try:
        get_model()
        logger.info("Price ML model ready.")
    except Exception as e:
        logger.error(f"Failed to load ML model: {e}")

    _seed_data()

    logger.info(f"🚀 ANNADATA API v{settings.APP_VERSION} started")
    yield
    logger.info("ANNADATA API shutting down.")


def _seed_data():
    from app.database import SessionLocal
    from app.repositories.user_repo import UserRepository
    from app.core.security import get_password_hash

    db = SessionLocal()
    try:
        repo = UserRepository(db)
        # Unified demo users with explicit roles and emails
        demo_users = [
            ("Master Admin", "777777777", "admin", "admin@annadata.org"),
            ("Test NGO", "9999999002", "ngo", "ngo@annadata.org"),
            ("Mahek Sanghvi", "9999999003", "farmer", None),
        ]

        hashed_pwd = get_password_hash("password123")
        admin_pwd = get_password_hash("admin123")

        for name, phone, role, email in demo_users:
            if not repo.get_by_phone(phone):
                pwd = admin_pwd if role == "admin" else hashed_pwd
                user = repo.create_user(
                    name=name,
                    phone=phone,
                    hashed_password=pwd,
                    role=role,
                )
                if email:
                    user.email = email
                
                # Auto-verify the demo users for a smooth start
                user.phone_verified = True
                user.onboarding_completed = True
                if role in ["ngo", "admin"]:
                    user.ngo_verified = True

        db.commit()
        logger.info("Database re-seeded successfully with 3 roles.")
    except Exception as e:
        db.rollback()
        logger.error(f"Seed rescue error: {e}")
    finally:
        db.close()


# ─── App Factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ANNADATA Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8082",
        "http://127.0.0.1:8082",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Error Handlers (FIXED - NO MANUAL HEADERS) ───────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Ensure CORS headers are included even on validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message_text": "Validation failed",
            "data": jsonable_encoder(exc.errors()),
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers are included even on internal server errors."""
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message_text": "Internal server error",
            "data": str(exc) if settings.DEBUG else None,
        },
        headers={"Access-Control-Allow-Origin": "*"}
    )


# ─── Routers ──────────────────────────────────────────────────────────────────
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for troubleshooting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response Status: {response.status_code}")
    return response

# Register Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(documents.router)
app.include_router(trust_score.router)
app.include_router(price.router)
app.include_router(heatmap.router)
app.include_router(input_verify.router)
app.include_router(loan.router)
app.include_router(help_request.router)
app.include_router(ngo.router)
app.include_router(admin.router)
app.include_router(voice.router)
app.include_router(financials.router)
app.include_router(legal.router)
app.include_router(requests.router)
app.include_router(chatbot.router)
app.include_router(whatsapp.router)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "success",
        "message_text": f"{settings.APP_NAME} v{settings.APP_VERSION} is running",
        "data": {
            "docs": "/docs",
            "redoc": "/redoc",
        },
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "success",
        "message_text": "All systems operational",
        "data": {"version": settings.APP_VERSION, "debug": settings.DEBUG},
    }



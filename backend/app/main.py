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
        demo_users = [
            ("Admin User", "9999999001", "admin"),
            ("Test NGO", "9999999002", "ngo"),
            ("Farmer 1", "9999999003", "farmer"),
            ("Farmer 2", "9999999004", "farmer"),
        ]

        hashed_pwd = get_password_hash("password123")

        for name, phone, role in demo_users:
            if not repo.get_by_phone(phone):
                repo.create_user(
                    name=name,
                    phone=phone,
                    hashed_password=hashed_pwd,
                    role=role,
                )
                logger.info(f"Seeded demo user: {phone} ({role})")
    except Exception as e:
        logger.error(f"Seed error: {e}")
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
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message_text": "Validation failed",
            "data": jsonable_encoder(exc.errors()),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message_text": "Internal server error",
            "data": str(exc) if settings.DEBUG else None,
        },
    )


# ─── Routers ──────────────────────────────────────────────────────────────────

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



import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "ANNADATA API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    SECRET_KEY: str = "annadata-super-secret-key-2024-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    DATABASE_URL: str = "sqlite:///./annadata.db"

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10

    MARKET_DATA_PATH: str = "app/data/market_data.csv"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

"""
REET API Configuration
Manages environment variables, service mock switches, and scoring thresholds.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "REET"
    VERSION: str = "1.0.0-mvp"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./reet_mvp.db")
    
    # Offline Deterministic Mock Switches (All True by default for zero-friction offline demo)
    MOCK_GITHUB: bool = os.getenv("MOCK_GITHUB", "true").lower() == "true"
    MOCK_SANDBOX: bool = os.getenv("MOCK_SANDBOX", "true").lower() == "true"
    MOCK_LLM: bool = os.getenv("MOCK_LLM", "true").lower() == "true"
    MOCK_EMBEDDER: bool = os.getenv("MOCK_EMBEDDER", "true").lower() == "true"
    MOCK_TRANSLATOR: bool = os.getenv("MOCK_TRANSLATOR", "true").lower() == "true"
    MOCK_TRANSCRIBER: bool = os.getenv("MOCK_TRANSCRIBER", "true").lower() == "true"
    MOCK_SAFE_BROWSING: bool = os.getenv("MOCK_SAFE_BROWSING", "true").lower() == "true"
    
    # Scoring Thresholds
    RUBRIC_WEIGHT_WORKS: float = 0.30
    RUBRIC_WEIGHT_CODE_QUALITY: float = 0.25
    RUBRIC_WEIGHT_ORIGINALITY: float = 0.15
    RUBRIC_WEIGHT_PRESENTATION: float = 0.10
    RUBRIC_WEIGHT_UNDERSTANDING: float = 0.20
    
    DUPLICATE_SIMILARITY_THRESHOLD: float = 0.88
    PROMPT_INJECTION_PENALTY: float = 2.5
    
    # Defense timer in seconds
    DEFENSE_TIME_LIMIT_SECONDS: int = 180

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

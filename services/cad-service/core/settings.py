from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings for the CAD service."""

    PORT: int = Field(default=8000, description="Port for the CAD service")

    ALLOWED_ORIGINS: list[str] = Field(
        default=["*"], description="CORS allowed origins"
    )
    ALLOWED_METHODS: list[str] = Field(
        default=["*"], description="CORS allowed methods"
    )
    ALLOWED_HEADERS: list[str] = Field(
        default=["*"], description="CORS allowed headers"
    )

    MODEL_EXPORT_PATH: str = Field(
        default="/app/web/public", description="Path to export CAD models"
    )

    class Config:
        """Configuration for Pydantic settings."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

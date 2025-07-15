from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings for the orchestrator service."""

    PORT: int = Field(default=8000, description="Port for the orchestrator service")

    ALLOWED_ORIGINS: list[str] = Field(
        default=["*"], description="CORS allowed origins"
    )
    ALLOWED_METHODS: list[str] = Field(
        default=["*"], description="CORS allowed methods"
    )
    ALLOWED_HEADERS: list[str] = Field(
        default=["*"], description="CORS allowed headers"
    )

    NER_SERVICE_URL: str = Field(
        default="http://ner-service:8000/api/", description="URL for the NER service"
    )

    CAD_SERVICE_URL: str = Field(
        default="http://cad-service:8000/api/", description="URL for the CAD service"
    )

    SERVICE_TIMEOUT: int = Field(
        default=5, description="Timeout for service requests in seconds"
    )

    class Config:
        """Configuration for Pydantic settings."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings for the NER service."""

    PORT: int = Field(default=8000, description="Port for the NER service")

    ALLOWED_ORIGINS: list[str] = Field(
        default=["*"], description="CORS allowed origins"
    )
    ALLOWED_METHODS: list[str] = Field(
        default=["*"], description="CORS allowed methods"
    )
    ALLOWED_HEADERS: list[str] = Field(
        default=["*"], description="CORS allowed headers"
    )

    NER_MODEL_PATH: str = Field(default="training/cad_ner_model")

    class Config:
        """Configuration for Pydantic settings."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

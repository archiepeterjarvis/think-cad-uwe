from pydantic import BaseModel, Field

from shared.models.base import CADConfiguration


class OrchestratorRequest(BaseModel):
    """Request model for the orchestrator service."""

    prompt: str = Field(description="Prompt to be processed")


class NERRequest(BaseModel):
    """Request model for the Named Entity Recognition (NER) service."""

    prompt: str = Field(..., description="Prompt text")


class CADRequest(BaseModel):
    """Request model for the CAD service."""

    prompt: str = Field(..., description="Prompt text")
    config: CADConfiguration = Field(default_factory=CADConfiguration)

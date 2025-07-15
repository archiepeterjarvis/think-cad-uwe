from typing import Optional

from pydantic import BaseModel, Field

from shared.models.misc import Entity


class NERResponse(BaseModel):
    error: Optional[str] = Field(None, description="Error message if any")
    entities: Optional[list[Entity]] = Field(
        default_factory=list, description="List of extracted entities"
    )


class CADResponse(BaseModel):
    error: Optional[str] = Field(None, description="Error message if any")
    warnings: Optional[list[str]] = Field(None, description="Warnings if any")
    model_path: Optional[str] = Field(
        None, description="Path to the generated CAD model"
    )

from pydantic import BaseModel, Field


class Entity(BaseModel):
    start: int = Field(..., description="Start index of the entity in the text")
    end: int = Field(..., description="End index of the entity in the text")
    label: str = Field(..., description="Label of the entity")
    text: str = Field(..., description="Text of the entity")

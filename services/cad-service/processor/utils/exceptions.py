from shared.models.exceptions import ValidationError
from shared.models.misc import Entity


def get_text_or_raise_verbose(label: str, entity: Entity) -> str:
    """Get the text of an entity or raise a verbose exception which can be fed back into the LLM."""
    if entity and entity.text:
        return entity.text

    raise ValidationError(
        f"Entity ${label} is missing or has no text. Please provide a valid entity for ${label}. This is required for the CAD model generation.",
        service="cad-service",
    )

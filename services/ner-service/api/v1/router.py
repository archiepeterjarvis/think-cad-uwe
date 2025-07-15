import logging

from fastapi import APIRouter, Depends

from core.deps import get_ner_model
from models.spacy_ner import SpacyNERModel
from shared.models.requests import NERRequest
from shared.models.responses import NERResponse

api_router = APIRouter()

logger = logging.getLogger(__name__)


@api_router.post("/extract")
async def extract(
    request: NERRequest, model: SpacyNERModel = Depends(get_ner_model)
) -> NERResponse:
    """Extract and group named entities from the provided request."""

    try:
        entities = model.predict(request.prompt)

        logger.debug(f"Extracted entities: {entities}")

        if not entities:
            return NERResponse(error="No entities found")

        return NERResponse(entities=entities, error=None)
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        return NERResponse(error=str(e))

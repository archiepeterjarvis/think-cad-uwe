import logging

from fastapi import APIRouter, Depends

from core.deps import get_cad_processor
from processor import CADProcessor
from shared.models.requests import CADRequest
from shared.models.responses import CADResponse

api_router = APIRouter()

logger = logging.getLogger(__name__)


@api_router.post("/generate")
async def generate(
    request: CADRequest, processor: CADProcessor = Depends(get_cad_processor)
) -> CADResponse:
    """Generate a CAD model based on the provided NER response."""
    try:
        result = await processor.process_configuration(request.config)
        file_path = processor.export_model(result, file_type="gltf")

        logger.info(f"CAD model generation complete - saved to {file_path}")

        return CADResponse(model_path=file_path, error=None, warnings=None)
    except Exception as e:
        logger.error(f"Error during CAD model generation: {e}")
        return CADResponse(model_path=None, error=str(e), warnings=None)

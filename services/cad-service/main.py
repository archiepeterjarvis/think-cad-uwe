import logging
from contextlib import asynccontextmanager

from api.v1.router import api_router
from core.deps import get_cad_processor
from core.settings import settings
from shared.utils.monitoring import create_monitored_app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_):
    """Load the NER model at startup and unload it at shutdown."""
    try:
        get_cad_processor()
        logger.info(f"CAD Processor initialised")
    except Exception as e:
        logger.error(f"Failed to load CAD Processor: {e}")
        raise e
    yield

    logger.info("Shutting down CAD service...")


app = create_monitored_app(service_name="cad-service")

app.include_router(api_router, prefix="/api/v1", tags=["CAD Service"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)

import logging
from contextlib import asynccontextmanager

from api.v1.router import api_router
from core.deps import get_ner_model
from core.settings import settings
from shared.utils.monitoring import create_monitored_app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_):
    """Load the NER model at startup and unload it at shutdown."""
    try:
        model = get_ner_model()
        logger.info(f"NER model loaded: {model.get_model_info()}")
    except Exception as e:
        logger.error(f"Failed to load NER model: {e}")
        raise e
    yield

    logger.info("Shutting down NER service...")


app = create_monitored_app(service_name="ner-service", lifespan=lifespan)

app.include_router(api_router, prefix="/api/v1", tags=["NER Service"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)

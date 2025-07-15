import logging

from api.v1.router import api_router
from core.settings import settings
from shared.utils.monitoring import create_monitored_app

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_monitored_app(service_name="orchestrator-service")

app.include_router(api_router, prefix="/api/v1", tags=["Orchestrator Service"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)

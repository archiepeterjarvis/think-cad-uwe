from clients import ServiceConfig
from core.settings import settings


def get_service_configs() -> dict[str, ServiceConfig]:
    """Get the service configurations for the orchestrator service."""
    return {
        "ner": ServiceConfig(
            base_url=settings.NER_SERVICE_URL,
            timeout=settings.SERVICE_TIMEOUT,
            api_version="v1",
            headers={"Content-Type": "application/json"},
        ),
        "cad": ServiceConfig(
            base_url=settings.CAD_SERVICE_URL,
            timeout=settings.SERVICE_TIMEOUT,
            api_version="v1",
            headers={"Content-Type": "application/json"},
        ),
    }

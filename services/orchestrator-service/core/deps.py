from functools import lru_cache

from core.service_config import get_service_configs

from clients.client_factory import ServiceClientFactory


@lru_cache()
def get_client_factory() -> ServiceClientFactory:
    """Get singleton service client factory."""
    configs = get_service_configs()
    return ServiceClientFactory(configs=configs)

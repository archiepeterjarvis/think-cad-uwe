import httpx
import logging
from typing import Any, Optional
from dataclasses import dataclass


@dataclass
class ServiceConfig:
    """Service configuration"""

    base_url: str
    timeout: int = 30
    api_version: str = "v1"
    api_key: Optional[str] = None
    headers: Optional[dict[str, str]] = None


class BaseClient:
    """Base HTTP client for services"""

    def __init__(self, config: ServiceConfig, service_name: str = "Unknown"):
        self.config = config
        self.service_name = service_name
        self.logger = logging.getLogger(f"services.{service_name}")

        headers = config.headers or {}
        if config.api_key:
            headers["Authorization"] = f"Bearer {config.api_key}"

        self.client = httpx.Client(
            base_url=config.base_url,
            timeout=config.timeout,
            headers=headers,
        )

    def post(self, endpoint: str, params: Optional[dict] = None) -> dict[str, Any]:
        """Make POST request"""
        try:
            response = self.client.post(
                f"{self.config.api_version}/{endpoint}", json=params
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"POST {endpoint} failed: {e.response.status_code} - {e.response.text}"
            )
            raise

    def get(self, endpoint: str, params: Optional[dict] = None) -> dict[str, Any]:
        """Make GET request"""
        try:
            response = self.client.get(
                f"{self.config.api_version}/{endpoint}", params=params
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"GET {endpoint} failed: {e.response.status_code} - {e.response.text}"
            )
            raise

    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = self.client.get(f"{self.config.api_version}/health")
            return response.status_code == 200
        except:
            return False

    def close(self):
        """Close the client"""
        self.client.close()
        self.logger.info(f"{self.service_name} client closed")

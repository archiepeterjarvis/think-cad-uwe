from shared.models.requests import CADRequest
from shared.models.responses import CADResponse
from .base_client import BaseClient, ServiceConfig


class CADClient(BaseClient):
    """Client for CAD service."""

    def __init__(self, config: ServiceConfig):
        super().__init__(config, service_name="cad")

    def generate_geometry(self, data: CADRequest):
        """Generate CAD geometry based on the provided configuration."""
        res = self.post("generate", params=data.model_dump())
        return CADResponse(**res)

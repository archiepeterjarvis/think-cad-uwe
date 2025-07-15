from shared.models.responses import NERResponse
from .base_client import BaseClient, ServiceConfig


class NERClient(BaseClient):
    """Client for NLP service"""

    def __init__(self, config: ServiceConfig):
        super().__init__(config, service_name="ner")

    def extract_entities(self, prompt: str) -> NERResponse:
        """Extract entities from the provided prompt."""
        data = {"prompt": prompt}
        res = self.post("extract", params=data)
        return NERResponse(**res)

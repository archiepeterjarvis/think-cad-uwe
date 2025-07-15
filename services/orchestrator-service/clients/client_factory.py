from clients import ServiceConfig, NERClient, CADClient


class ServiceClientFactory:
    """Factory to create and manage service clients"""

    def __init__(self, configs: dict[str, ServiceConfig]):
        self.configs = configs
        self._clients = {}

    def get_nlp_client(self) -> NERClient:
        """Get or create ner client"""
        if "ner" not in self._clients:
            self._clients["ner"] = NERClient(self.configs["ner"])
        return self._clients["ner"]

    def get_cad_client(self) -> CADClient:
        """Get or create CAD client"""
        if "cad" not in self._clients:
            self._clients["cad"] = CADClient(self.configs["cad"])
        return self._clients["cad"]

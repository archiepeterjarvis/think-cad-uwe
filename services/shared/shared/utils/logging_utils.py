import json
import logging
from datetime import datetime
from typing import Dict, Any


class ServiceLogger:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)

    def log_request(self, request_id: str, endpoint: str, data: Dict[str, Any]):
        self.logger.info(
            json.dumps(
                {
                    "timestamp": datetime.now().isoformat(),
                    "service": self.service_name,
                    "request_id": request_id,
                    "event": "request_received",
                    "endpoint": endpoint,
                    "data_size": len(str(data)),
                }
            )
        )

    def log_service_call(self, target_service: str, request_id: str, success: bool):
        self.logger.info(
            json.dumps(
                {
                    "timestamp": datetime.now().isoformat(),
                    "service": self.service_name,
                    "request_id": request_id,
                    "event": "service_call",
                    "target": target_service,
                    "success": success,
                }
            )
        )

class CADServiceException(Exception):
    """Base exception for CAD service errors."""

    def __init__(self, message: str, service: str, error_code: str = None):
        self.message = message
        self.service = service
        self.error_code = error_code
        super().__init__(f"[{service}] {message} (Error Code: {error_code})")


class ValidationError(CADServiceException):
    pass


class GeometryError(CADServiceException):
    pass


class ExportError(CADServiceException):
    pass

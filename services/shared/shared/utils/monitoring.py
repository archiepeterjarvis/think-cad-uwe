from typing import Optional

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from prometheus_fastapi_instrumentator import Instrumentator

from core.settings import settings


class MonitoringSetup:
    def __init__(self, service_name):
        self.service_name = service_name
        self.instrumentator = None

    def setup_prometheus(self, app: FastAPI) -> Instrumentator:
        """Configure Prometheus instrumentation for the FastAPI app."""
        self.instrumentator = Instrumentator(
            should_group_status_codes=False,
            should_ignore_untemplated=True,
            should_respect_env_var=True,
            should_instrument_requests_inprogress=True,
            excluded_handlers=["/metrics"],
            env_var_name="ENABLE_METRICS",
            inprogress_name="inprogress",
            inprogress_labels=True,
        )

        self.instrumentator.instrument(app)
        return self.instrumentator

    def add_health_endpoint(self, app: FastAPI):
        """Add a health check endpoint to the FastAPI app."""

        @app.get("/health")
        async def health_check():
            return {"status": "healthy"}

    def instrument_app(self, app: FastAPI):
        """Complete monitoring setup for the FastAPI app."""
        FastAPIInstrumentor.instrument_app(
            app, tracer_provider=trace.get_tracer_provider()
        )
        RequestsInstrumentor.instrument()

        self.setup_prometheus(app)
        self.add_health_endpoint(app)
        self.instrumentator.expose(app)


def create_monitored_app(
    service_name: str,
    lifespan: Optional[callable] = None,
) -> FastAPI:
    """Factory function to create a FastAPI app with monitoring"""

    app = FastAPI(title=service_name, lifespan=lifespan)

    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=settings.ALLOWED_METHODS,
        allow_headers=settings.ALLOWED_HEADERS,
    )

    # Setup monitoring
    MonitoringSetup(service_name)

    return app


def trace_endpoint(operation_name: Optional[str] = None):
    """Decorator to add tracing to endpoint functions"""

    def decorator(func):
        async def wrapper(*args, **kwargs):
            tracer = trace.get_tracer(__name__)
            span_name = operation_name or f"{func.__name__}"

            with tracer.start_as_current_span(span_name) as span:
                try:
                    result = await func(*args, **kwargs)
                    span.set_status(trace.Status(trace.StatusCode.OK))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                    raise

        return wrapper

    return decorator

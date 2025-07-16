import logging

from core.mapping import CADMapper
from fastapi import APIRouter, Depends

from clients.client_factory import ServiceClientFactory
from core.deps import get_client_factory
from shared.models.requests import OrchestratorRequest, CADRequest

api_router = APIRouter()
cad_mapper = CADMapper()

logger = logging.getLogger(__name__)


@api_router.get("/health")
async def health_check(
        client_factory: ServiceClientFactory = Depends(get_client_factory),
):
    """Health check endpoint to verify each service is running."""

    # Check all configured services
    for service_name in client_factory.configs.keys():
        try:
            client = getattr(client_factory, f"get_{service_name}_client")()
            if not client.health_check():
                logger.error(f"Service {service_name} is not healthy")
                return {
                    "status": "error",
                    "message": f"{service_name} service is not running",
                }
        except Exception as e:
            logger.error(f"Failed to check {service_name} service: {e}")
            return {
                "status": "error",
                "message": f"Failed to check {service_name} service",
            }

    return {"status": "ok", "message": "Orchestrator service is running"}


@api_router.post("/pipeline")
async def run_pipeline(
        request: OrchestratorRequest,
        client_factory: ServiceClientFactory = Depends(get_client_factory),
):
    """Run the pipeline with the provided request."""

    logger.info(f"Starting orchestrator pipeline with request: {request.prompt}")

    # Get the HTTP clients from the factory
    ner_client = client_factory.get_nlp_client()
    cad_client = client_factory.get_cad_client()

    # Send the request to the NER service and process the response
    try:
        ner_response = ner_client.extract_entities(request.prompt)
        logger.debug(f"NER response: {ner_response}")
    except Exception as e:
        logger.error(f"Error during processing: {e}")
        return {"status": "error", "message": str(e)}

    try:
        entities_dict = [entity.model_dump() for entity in ner_response.entities]
        config = cad_mapper.process_entities(entities_dict)
        logger.debug(f"Config response: {config}")
    except Exception as e:
        logger.error(f"Error mapping entities to configuration: {e}")
        raise e
        return {"status": "error", "message": str(e)}

    # Send the NER response to the CAD service to generate geometry
    try:
        cad_response = cad_client.generate_geometry(CADRequest(prompt=request.prompt, config=config))
        logger.debug(f"CAD response: {cad_response}")
    except Exception as e:
        logger.error(f"Error during processing: {e}")
        return {"status": "error", "message": str(e)}

    return {
        "status": "ok",
        "message": "Orchestrator pipeline completed",
        "file_path": cad_response.model_path,
    }

import logging
import os
import uuid
from typing import Optional

from cadquery import cq, Assembly

from core.settings import settings
from processor.gears import get_gear_handlers
from processor.interfaces import ShapeHandler, OperationHandler, Exporter
from processor.shapes import get_shape_handlers
from shared.models.base import CADConfiguration

logger = logging.getLogger(__name__)


class CADProcessor:
    """Main processor that coordinates all CAD operations"""

    def __init__(self, cache: bool = True):
        self.shape_handlers: dict[str, ShapeHandler] = {}
        self.operation_handlers: dict[str, OperationHandler] = {}
        self.exporters: dict[str, Exporter] = {}

        self._register_handlers()

    def _register_handlers(self):
        """Register all available handlers"""
        for handler_class in get_shape_handlers():
            handler = handler_class()
            for shape_type in handler.supported_types:
                self.shape_handlers[shape_type] = handler
                logger.debug(
                    f"Registered shape: {shape_type} (handler: {handler_class.__name__})"
                )

        for handler_class in get_gear_handlers():
            handler = handler_class()
            for gear_type in handler.supported_types:
                self.shape_handlers[gear_type] = handler
                logger.debug(
                    f"Registered gear: {gear_type} (handler: {handler_class.__name__})"
                )

    async def process_configuration(self, config: CADConfiguration) -> cq.Workplane:
        """Main processing entry point"""

        result = await self._process_components(config)

        logger.info("CAD configuration processing complete")
        return result

    def export_model(self, model: cq.Workplane, file_type: str) -> str:
        """Export the CAD model to a file"""
        try:
            assembly = Assembly()
            assembly.add(model, name="main_shape")
            file_name = f"{uuid.uuid4()}.{file_type}"
            file_path = f"{settings.MODEL_EXPORT_PATH}{os.path.sep}{file_name}"
            os.makedirs(settings.MODEL_EXPORT_PATH, exist_ok=True)
            assembly.export(file_path)
            logger.info(f"Model exported successfully to {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Failed to export model: {e}")
            raise RuntimeError(f"Model export failed: {str(e)}")

    async def _process_components(self, config: CADConfiguration) -> cq.Workplane:
        """Process all components in the configuration."""
        components = {}
        result = None

        # Process basic components (shapes and gears)
        for comp_type, items, handlers in [
            ("shape", config.shapes, self.shape_handlers),
        ]:
            result = await self._process_entities(comp_type, items, handlers, components, result)

        # Process operations (e.g., booleans, transforms)
        if config.operations:
            for operation in config.operations:
                logger.debug(f"Processing operation (type: {operation.type})")

                handler = self.operation_handlers.get(operation.type)
                if not handler:
                    raise ValueError(f"No handler for operation type {operation.type}")

                result = await handler.apply(result, operation, components)

        return result or cq.Workplane("XY")

    async def _process_entities(
            self,
            entity_type: str,
            items: list,
            handlers: dict,
            components: dict,
            result: Optional[cq.Workplane],
    ) -> cq.Workplane:
        if not items:
            return result

        for i, item in enumerate(items):
            entity_id = item.id or f"{entity_type}_{i}"
            logger.debug(f"Processing {entity_type}: {entity_id} (type: {item.type})")

            handler = handlers.get(item.type)
            if not handler:
                raise ValueError(f"No handler for {entity_type} type {item.type}")

            obj = await handler.create(item.parameters, item.position, item.rotation)
            components[entity_id] = obj

            result = obj if result is None else result.union(obj)

        return result

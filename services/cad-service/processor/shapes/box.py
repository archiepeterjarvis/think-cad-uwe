from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import BoxParameters
from shared.models.exceptions import ValidationError


class BoxHandler(BaseShapeHandler):
    """Handler for box shapes"""

    async def create(
        self, parameters: BoxParameters, position: list, rotation: list
    ) -> cq.Workplane:
        """Create a box shape"""
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.box(
            parameters.length,
            parameters.width,
            parameters.height,
            centered=parameters.centered,
        )

        if parameters.features:
            obj = await self._apply_features(obj, parameters.features)

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: BoxParameters) -> bool:
        """Validate box parameters"""
        return isinstance(parameters, BoxParameters)

    @property
    def supported_types(self) -> list[str]:
        return ["box"]

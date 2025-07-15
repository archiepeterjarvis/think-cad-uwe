from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import CylinderParameters
from shared.models.exceptions import ValidationError


class CylinderHandler(BaseShapeHandler):
    """Handler for cylinder shapes"""

    async def create(
        self, parameters: CylinderParameters, position: list, rotation: list
    ) -> cq.Workplane:
        """Create a cylinder shape"""
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.cylinder(
            height=parameters.height,
            radius=parameters.radius,
            angle=parameters.angle,
            centered=parameters.centered,
        )

        if parameters.features:
            obj = await self._apply_features(obj, parameters.features)

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: CylinderParameters) -> bool:
        """Validate cylinder parameters"""
        if not isinstance(parameters, CylinderParameters):
            return False

        return (
            parameters.radius > 0
            and parameters.height > 0
            and 0 <= parameters.angle <= 360
        )

    @property
    def supported_types(self) -> list[str]:
        return ["cylinder"]

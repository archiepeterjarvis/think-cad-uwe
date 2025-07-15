from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import ConeParameters
from shared.models.exceptions import ValidationError


class ConeHandler(BaseShapeHandler):
    """Handler for cone shapes"""

    async def create(
        self, parameters: ConeParameters, position: list, rotation: list
    ) -> cq.Workplane:
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid cone parameters", service="cad-service")

        wp = cq.Workplane("XY")

        raise NotImplementedError("Not implemented")

        if parameters.features:
            obj = await self._apply_features(obj, parameters.features)

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: ConeParameters) -> bool:
        if not isinstance(parameters, ConeParameters):
            return False

        return (
            parameters.radius1 >= 0
            and parameters.radius2 >= 0
            and parameters.height > 0
            and 0 <= parameters.angle <= 360
        )

    @property
    def supported_types(self) -> list[str]:
        return ["cone"]

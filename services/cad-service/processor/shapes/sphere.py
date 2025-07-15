from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import SphereParameters
from shared.models.exceptions import ValidationError


class SphereHandler(BaseShapeHandler):
    """Handler for sphere shape"""

    async def create(
        self, parameters: SphereParameters, position: list, rotation: list
    ) -> cq.Workplane:
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.sphere(
            radius=parameters.radius,
            angle1=parameters.angle1,
            angle2=parameters.angle2,
            angle3=parameters.angle3,
            centered=parameters.centered,
        )

        if parameters.features:
            obj = await self._apply_features(obj, parameters.features)

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: SphereParameters) -> bool:
        if not isinstance(parameters, SphereParameters):
            return False

        return (
            parameters.radius > 0
            and -90 <= parameters.angle1 <= 90
            and -90 <= parameters.angle2 <= 90
            and 0 <= parameters.angle3 <= 360
        )

    @property
    def supported_types(self) -> list[str]:
        return ["sphere"]

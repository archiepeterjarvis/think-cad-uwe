from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import WedgeParameters
from shared.models.exceptions import ValidationError


class WedgeHandler(BaseShapeHandler):
    """Handler for wedge shapes"""

    async def create(
        self, parameters: WedgeParameters, position: list, rotation: list
    ) -> cq.Workplane:
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.wedge(
            dx=parameters.dx,
            dy=parameters.dy,
            dz=parameters.dz,
            xmin=parameters.xmin,
            zmin=parameters.zmin,
            xmax=parameters.xmax,
            zmax=parameters.zmax,
        )

        if parameters.features:
            obj = await self._apply_features(obj, parameters.features)

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: WedgeParameters) -> bool:
        if not isinstance(parameters, WedgeParameters):
            return False

        return parameters.dx > 0 and parameters.dy > 0 and parameters.dz > 0

    @property
    def supported_types(self) -> list[str]:
        return ["wedge"]

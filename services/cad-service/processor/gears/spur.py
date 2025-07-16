import cq_gears
from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import SpurGearParameters
from shared.models.exceptions import ValidationError


class SpurGearHandler(BaseShapeHandler):
    """Handler for spur gears"""

    async def create(
        self, parameters: SpurGearParameters, position: list, rotation: list
    ) -> cq.Workplane:
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.gear(
            cq_gears.SpurGear(
                module=parameters.module,
                teeth_number=parameters.teeth,
                width=parameters.width,
                pressure_angle=parameters.pressure_angle,
                clearance=parameters.clearance,
                backlash=parameters.backlash,
                bore_d=5.0,
                hub_d=parameters.hub_diameter,
                hub_length=parameters.hub_length,
            ),
        )

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: SpurGearParameters) -> bool:
        if not isinstance(parameters, SpurGearParameters):
            return False

        return True  # TODO: Check parameters

    @property
    def supported_types(self) -> list[str]:
        return ["spur_gear"]

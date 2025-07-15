import cq_gears
from cadquery import cq

from processor.shapes.base import BaseShapeHandler
from shared.models.base import BevelGearParameters
from shared.models.exceptions import ValidationError


class BevelGearHandler(BaseShapeHandler):
    async def create(
        self, parameters: BevelGearParameters, position: list, rotation: list
    ) -> cq.Workplane:
        if not self.validate_parameters(parameters):
            raise ValidationError("Invalid parameters", service="cad-service")

        wp = cq.Workplane("XY")
        obj = wp.gear(
            cq_gears.BevelGear(
                module=parameters.module,
                teeth_number=parameters.teeth,
                bore_d=parameters.bore,
                pressure_angle=parameters.pressure_angle,
                cone_angle=parameters.cone_angle,
                helix_angle=parameters.helix_angle,
                clearance=parameters.clearance,
                backlash=parameters.backlash,
                face_width=parameters.face_width,
            )
        )

        return await self._apply_transformations(obj, position, rotation)

    def validate_parameters(self, parameters: BevelGearParameters) -> bool:
        if not isinstance(parameters, BevelGearParameters):
            return False

        return True

    @property
    def supported_types(self) -> list[str]:
        return ["bevel"]

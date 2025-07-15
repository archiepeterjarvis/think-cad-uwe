import pytest
from processor.gears import BevelGearHandler
from shared.models.base import BevelGearParameters

@pytest.mark.asyncio
async def test_helical_gear_creation():
    handler = BevelGearHandler()

    params = BevelGearParameters(
        type="bevel_gear",
        module=1.5,
        teeth=30,
        cone_angle=45.0,
        pressure_angle=20.0,
        helix_angle=15.0,
        bore=5.0,
        clearance=0.1,
        backlash=0.05,
        face_width=10.0,
    )

    wp = await handler.create(params, position=[0, 0, 0], rotation=[0, 0, 0])
    assert wp is not None
    assert hasattr(wp, "val")


def test_helical_gear_validation():
    handler = BevelGearHandler()

    valid_params = BevelGearParameters(
        type="bevel_gear",
        module=1.5,
        teeth=30,
        cone_angle=45.0,
        pressure_angle=20.0,
        helix_angle=15.0,
        bore=5.0,
        clearance=0.1,
        backlash=0.05,
        face_width=10.0,
    )

    assert handler.validate_parameters(valid_params) is True

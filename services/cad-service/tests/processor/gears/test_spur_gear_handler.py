import pytest

from processor.gears import SpurGearHandler
from shared.models.base import SpurGearParameters


@pytest.mark.asyncio
async def test_spur_gear_creation():
    handler = SpurGearHandler()

    params = SpurGearParameters(
        type="spur_gear",
        module=1.0,
        teeth=20,
        width=5.0,
        pressure_angle=20.0,
        clearance=0.1,
        backlash=0.05,
        hub_diameter=8.0,
        hub_length=10.0,
    )

    wp = await handler.create(params, position=[0, 0, 0], rotation=[0, 0, 0])
    assert wp is not None
    assert hasattr(wp, "val")


def test_spur_gear_validation():
    handler = SpurGearHandler()
    
    valid_params = SpurGearParameters(
        type="spur_gear",
        module=1.0,
        teeth=20,
        width=5.0,
        pressure_angle=20.0,
        clearance=0.1,
        backlash=0.05,
        hub_diameter=8.0,
        hub_length=10.0,
    )
    
    assert handler.validate_parameters(valid_params) is True
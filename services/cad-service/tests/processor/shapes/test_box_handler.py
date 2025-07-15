import pytest
from processor.shapes.box import BoxHandler
from shared.models.base import BoxParameters

@pytest.mark.asyncio
async def test_box_creation():
    handler = BoxHandler()

    params = BoxParameters(
        type="box",
        length=10.0,
        width=10.0,
        height=10.0,
        centered=True,
        features=[],
    )

    wp = await handler.create(params, position=[0, 0, 0], rotation=[0, 0, 0])
    assert wp is not None
    assert hasattr(wp, "val")


def test_box_validation():
    handler = BoxHandler()

    valid_params = BoxParameters(
        type="box",
        length=10.0,
        width=10.0,
        height=10.0,
        centered=False,
        features=[],
    )

    assert handler.validate_parameters(valid_params) is True

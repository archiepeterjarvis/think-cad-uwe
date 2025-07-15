from .box import BoxHandler
from .cylinder import CylinderHandler
from .sphere import SphereHandler
from .wedge import WedgeHandler


def get_shape_handlers():
    """Return all available handlers"""
    return [BoxHandler, CylinderHandler, SphereHandler, WedgeHandler]


__all__ = [
    "BoxHandler",
    "CylinderHandler",
    "SphereHandler",
    "WedgeHandler",
    "get_shape_handlers",
]

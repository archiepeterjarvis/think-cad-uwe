from .spur import SpurGearHandler
from .bevel import BevelGearHandler


def get_gear_handlers():
    """Return all available handlers"""
    return [SpurGearHandler, BevelGearHandler]


__all__ = ["get_gear_handlers", "SpurGearHandler", "BevelGearHandler"]

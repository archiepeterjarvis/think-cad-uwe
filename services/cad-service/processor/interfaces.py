import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict

from cadquery import cq

logger = logging.getLogger(__name__)


class ShapeHandler(ABC):
    """Abstract base class for shape handlers"""

    @abstractmethod
    async def create(
        self, parameters: Any, position: list, rotation: list
    ) -> cq.Workplane:
        """Create a shape with given parameters and transformations"""
        pass

    @abstractmethod
    def validate_parameters(self, parameters: dict[str, Any]) -> bool:
        """Validate parameters and return descriptive messages"""
        pass

    @property
    @abstractmethod
    def supported_types(self) -> list[str]:
        """Return list of supported shape types"""
        pass

    async def _apply_transformations(
        self, obj: cq.Workplane, position: list, rotation: list
    ) -> cq.Workplane:
        """Apply position and rotation transformations"""
        if position != [0, 0, 0]:
            obj = obj.translate(tuple(position))
            logger.debug(f"Applied translation: {position}")

        if rotation != [0, 0, 0]:
            rx, ry, rz = rotation
            if rx != 0:
                obj = obj.rotate((0, 0, 0), (1, 0, 0), rx)
            if ry != 0:
                obj = obj.rotate((0, 0, 1), (0, 1, 0), ry)
            if rz != 0:
                obj = obj.rotate((0, 0, 2), (0, 0, 1), rz)

            logger.debug(f"Applied rotation: {rotation}")

        return obj


class GearHandler(ABC):
    """Abstract base class for gear handlers"""

    @abstractmethod
    async def create(
        self, parameters: Any, position: list, rotation: list
    ) -> cq.Workplane:
        """Create a gear with given parameters and transformations"""
        pass

    @abstractmethod
    def validate_parameters(self, parameters: dict[str, Any]) -> bool:
        """Validate parameters and return descriptive messages"""
        pass

    @property
    @abstractmethod
    def supported_types(self) -> list[str]:
        """Return list of supported gear types"""


class OperationHandler(ABC):
    """Abstract base class for operation handlers"""

    @abstractmethod
    async def apply(
        self, target: cq.Workplane, operation: Any, objects: Dict[str, cq.Workplane]
    ) -> cq.Workplane:
        """Apply operation to target object"""
        pass

    @property
    @abstractmethod
    def supported_types(self) -> list[str]:
        """Return list of supported operation types"""
        pass


class Exporter(ABC):
    """Abstract base class for exporters"""

    @abstractmethod
    async def export(
        self, target: cq.Workplane, output_path: Path, **kwargs
    ) -> cq.Workplane:
        """Export model to specified format"""
        pass

    @property
    @abstractmethod
    def format_name(self) -> str:
        """Return name of export format"""
        pass

    @property
    @abstractmethod
    def file_extension(self) -> str:
        """Return file extension of export format"""
        pass

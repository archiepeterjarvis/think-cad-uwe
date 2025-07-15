import logging
from abc import ABC
from typing import Any

from cadquery import cq

from processor.interfaces import ShapeHandler
from shared.models.features import FeatureUnion, CircularHole

logger = logging.getLogger(__name__)


class BaseShapeHandler(ShapeHandler, ABC):
    """Base implementation for shape handlers"""

    async def _apply_features(
        self, obj: cq.Workplane, features: list[FeatureUnion]
    ) -> cq.Workplane:
        """Apply features to workplane"""
        for feature in features:
            face_wp = obj.faces(feature.face).workplane(centerOption="CenterOfMass")
            if isinstance(feature, CircularHole):
                obj = face_wp.move(*feature.position).hole(
                    diameter=feature.diameter, depth=feature.depth
                )
                logger.debug(
                    f"Applied circular hole at {feature.position} (diameter: {feature.diameter}, depth: {feature.depth})"
                )

        return obj

    def validate_parameters(self, parameters: dict[str, Any]) -> bool:
        """Default validation"""
        return parameters is not None

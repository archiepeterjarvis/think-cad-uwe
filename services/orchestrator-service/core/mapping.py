import logging
from typing import Any, Dict, List, Optional
from uuid import uuid4

from shared.models.base import (
    CADConfiguration, Shape, BoxParameters, CylinderParameters,
    SphereParameters, ConeParameters, TorusParameters, WedgeParameters,
    Units, Metadata, SpurGearParameters
)

CANONICAL_TYPE_MAPPING = {
    "plate": "box"
}


class CADConfigurationMapper:
    """Maps processed NLP entities to CADConfiguration objects."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.shape_mappers = {
            "box": self._create_box_parameters,
            "cube": self._create_box_parameters,
            "cylinder": self._create_cylinder_parameters,
            "sphere": self._create_sphere_parameters,
            "cone": self._create_cone_parameters,
            "torus": self._create_torus_parameters,
            "wedge": self._create_wedge_parameters,
            "plate": self._create_box_parameters,
            "spur gear": self._create_spur_gear_parameters,
        }

    def map_to_configuration(self, processed_entities: Dict[str, Any]) -> CADConfiguration:
        """Convert processed entities to CADConfiguration."""
        self.logger.debug(f"Mapping entities: {processed_entities}")

        metadata = Metadata(
            name=f"Generated CAD Model",
            description="Auto-generated from NLP processing",
            version="1.0",
            units=self._get_primary_unit(processed_entities.get("dimensions", []))
        )

        shapes = []
        shape_type = processed_entities.get("shape_type")

        if shape_type:
            shape = self._create_shape(processed_entities)
            if shape:
                shapes.append(shape)

        return CADConfiguration(
            metadata=metadata,
            shapes=shapes,
            gears=None,
            operations=None,
            sketch=None,
            export=None
        )

    def _get_primary_unit(self, dimensions: List[Dict[str, Any]]) -> Units:
        """Determine the primary unit from dimensions."""
        if not dimensions:
            return Units.MM

        for dim in dimensions:
            unit = dim.get("unit")
            if unit:
                unit_lower = unit.lower()
                if unit_lower in ["mm", "millimeter", "millimeters"]:
                    return Units.MM
                elif unit_lower in ["cm", "centimeter", "centimeters"]:
                    return Units.CM
                elif unit_lower in ["m", "meter", "meters"]:
                    return Units.M
                elif unit_lower in ["in", "inch", "inches"]:
                    return Units.IN
                elif unit_lower in ["ft", "foot", "feet"]:
                    return Units.FT

        return Units.MM

    def _create_shape(self, entities: Dict[str, Any]) -> Optional[Shape]:
        """Create a Shape object from processed entities."""
        shape_type = entities.get("shape_type", "").lower()

        if shape_type not in self.shape_mappers:
            self.logger.warning(f"Unknown shape type: {shape_type}")
            return None

        try:
            parameters = self.shape_mappers[shape_type](
                entities.get("dimensions", []),
                entities.get("features", {})
            )
            
            if shape_type in CANONICAL_TYPE_MAPPING:
                shape_type = CANONICAL_TYPE_MAPPING[shape_type]

            return Shape(
                id=str(uuid4()),
                type=shape_type if shape_type != "cube" else "box",
                parameters=parameters,
                position=[0, 0, 0],
                rotation=[0, 0, 0]
            )
        except Exception as e:
            self.logger.error(f"Failed to create shape: {e}")
            raise e
            return None

    def _create_spur_gear_parameters(self, dimensions: List[Dict], features: Dict) -> BoxParameters:
        return SpurGearParameters.create(dimensions, features)

    def _create_box_parameters(self, dimensions: List[Dict], features: Dict) -> BoxParameters:
        """Create BoxParameters from dimensions and features."""
        return BoxParameters.create(dimensions, features)

    def _create_cylinder_parameters(self, dimensions: List[Dict], features: Dict) -> CylinderParameters:
        """Create CylinderParameters from dimensions and features."""
        if len(dimensions) < 2:
            raise ValueError("Cylinder requires at least 2 dimensions (radius/diameter and height)")

        radius_dim = dimensions[0]
        radius_value = float(radius_dim.get("dimension", 0))
        radius_unit = radius_dim.get("unit", "mm")

        if "diameter" in str(radius_dim.get("dimension", "")).lower():
            radius_value = radius_value / 2

        radius = Units.convert_to_mm(radius_value, radius_unit)

        height_dim = dimensions[1]
        height = Units.convert_to_mm(
            float(height_dim.get("dimension", 0)),
            height_dim.get("unit", "mm")
        )

        return CylinderParameters(
            radius=radius,
            height=height,
            angle=360,
            features=self._parse_features(features)
        )

    def _create_sphere_parameters(self, dimensions: List[Dict], features: Dict) -> SphereParameters:
        """Create SphereParameters from dimensions and features."""
        if len(dimensions) < 1:
            raise ValueError("Sphere requires at least 1 dimension (radius/diameter)")

        radius_dim = dimensions[0]
        radius_value = float(radius_dim.get("dimension", 0))
        radius_unit = radius_dim.get("unit", "mm")

        if "diameter" in str(radius_dim.get("dimension", "")).lower():
            radius_value = radius_value / 2

        radius = Units.convert_to_mm(radius_value, radius_unit)

        return SphereParameters(
            radius=radius,
            features=self._parse_features(features)
        )

    def _create_cone_parameters(self, dimensions: List[Dict], features: Dict) -> ConeParameters:
        """Create ConeParameters from dimensions and features."""
        if len(dimensions) < 3:
            raise ValueError("Cone requires 3 dimensions (radius1, radius2, height)")

        radius1 = Units.convert_to_mm(
            float(dimensions[0].get("dimension", 0)),
            dimensions[0].get("unit", "mm")
        )
        radius2 = Units.convert_to_mm(
            float(dimensions[1].get("dimension", 0)),
            dimensions[1].get("unit", "mm")
        )
        height = Units.convert_to_mm(
            float(dimensions[2].get("dimension", 0)),
            dimensions[2].get("unit", "mm")
        )

        return ConeParameters(
            radius1=radius1,
            radius2=radius2,
            height=height,
            features=self._parse_features(features)
        )

    def _create_torus_parameters(self, dimensions: List[Dict], features: Dict) -> TorusParameters:
        """Create TorusParameters from dimensions and features."""
        if len(dimensions) < 2:
            raise ValueError("Torus requires 2 dimensions (major_radius, minor_radius)")

        major_radius = Units.convert_to_mm(
            float(dimensions[0].get("dimension", 0)),
            dimensions[0].get("unit", "mm")
        )
        minor_radius = Units.convert_to_mm(
            float(dimensions[1].get("dimension", 0)),
            dimensions[1].get("unit", "mm")
        )

        return TorusParameters(
            major_radius=major_radius,
            minor_radius=minor_radius,
            features=self._parse_features(features)
        )

    def _create_wedge_parameters(self, dimensions: List[Dict], features: Dict) -> WedgeParameters:
        """Create WedgeParameters from dimensions and features."""
        if len(dimensions) < 3:
            raise ValueError("Wedge requires 3 dimensions (dx, dy, dz)")

        dx = Units.convert_to_mm(
            float(dimensions[0].get("dimension", 0)),
            dimensions[0].get("unit", "mm")
        )
        dy = Units.convert_to_mm(
            float(dimensions[1].get("dimension", 0)),
            dimensions[1].get("unit", "mm")
        )
        dz = Units.convert_to_mm(
            float(dimensions[2].get("dimension", 0)),
            dimensions[2].get("unit", "mm")
        )

        return WedgeParameters(
            dx=dx,
            dy=dy,
            dz=dz,
            features=self._parse_features(features)
        )

    def _parse_features(self, features: Dict) -> List:
        """Parse features dictionary into feature objects."""
        if features is None:
            return []


class CADMapper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.config_mapper = CADConfigurationMapper()
        self.processors = {
            "SHAPE_TYPE": self._process_shape_type,
            "SHAPE_DIMENSION": self._process_dimension,
            "FEATURE_COUNT": self._process_feature_count,
            "FEATURE": self._process_feature_type,
            "HOLE_DIAMETER": self._process_hole_diameter,
            "HOLE_CORNER_OFFSET": self._process_hole_corner_offset,
            "GEAR_TEETH": self._process_gear_teeth,
        }

    def process_entities(self, entities: List[Dict]) -> CADConfiguration:
        """Process entities and return CADConfiguration."""
        self.logger.debug(f"Processing {len(entities)} entities")

        raw_config = {"shape_type": None, "dimensions": [], "features": {}}
        i = 0

        while i < len(entities):
            entity = entities[i]
            processor = self.processors.get(entity["label"])

            if processor:
                i = processor(raw_config, entities, i)
            else:
                i += 1

        return self.config_mapper.map_to_configuration(raw_config)

    def _get_next_unit(self, entities: List[Dict], index: int) -> Optional[str]:
        """Get unit following current entity if it exists."""
        next_idx = index + 1
        if next_idx < len(entities) and entities[next_idx]["label"] == "UNIT":
            return entities[next_idx]["text"]
        return None

    def _process_shape_type(self, config: Dict, entities: List[Dict], index: int) -> int:
        config["shape_type"] = entities[index]["text"]
        return index + 1

    def _process_dimension(self, config: Dict, entities: List[Dict], index: int) -> int:
        dimension = entities[index]["text"]
        unit = self._get_next_unit(entities, index)

        config["dimensions"].append({"dimension": dimension, "unit": unit})

        if unit:
            self.logger.debug(f"Paired dimension '{dimension}' with unit '{unit}'")
            return index + 2
        else:
            self.logger.warning(f"Dimension '{dimension}' has no unit")
            return index + 1

    def _process_feature_count(self, config: Dict, entities: List[Dict], index: int) -> int:
        config["features"]["count"] = entities[index]["text"]
        return index + 1

    def _process_feature_type(self, config: Dict, entities: List[Dict], index: int) -> int:
        config["features"]["type"] = entities[index]["text"]
        return index + 1

    def _process_hole_diameter(self, config: Dict, entities: List[Dict], index: int) -> int:
        value = entities[index]["text"]
        unit = self._get_next_unit(entities, index)
        config["features"]["diameter"] = {"value": value, "unit": unit}
        return index + 1

    def _process_hole_corner_offset(self, config: Dict, entities: List[Dict], index: int) -> int:
        value = entities[index]["text"]
        unit = self._get_next_unit(entities, index)
        config["features"]["corner_offset"] = {"value": value, "unit": unit}
        return index + 1

    def _process_gear_teeth(self, config: Dict, entities: List[Dict], index: int) -> int:
        config["features"]["teeth"] = float(entities[index]["text"])
        return index + 1

import re
from typing import List, Dict, Any
from collections import defaultdict


def group_entities_by_proximity(
    entities: List[Dict], text: str, max_distance: int = 10
) -> List[Dict]:
    """
    Group entities that are close to each other in the text
    """
    grouped = []
    used_indices = set()

    for i, entity in enumerate(entities):
        if i in used_indices:
            continue

        group = [entity]
        used_indices.add(i)

        # Find nearby entities
        for j, other_entity in enumerate(entities):
            if j in used_indices or i == j:
                continue

            distance = abs(entity["start"] - other_entity["start"])
            if distance <= max_distance:
                group.append(other_entity)
                used_indices.add(j)

        grouped.append(group)

    return grouped


def group_entities_semantic(entities: List[Dict], text: str) -> Dict[str, Any]:
    """
    Group entities based on semantic relationships for CAD/manufacturing
    """
    result = {
        "command": None,
        "shape": None,
        "shape_modifiers": [],
        "dimensions": [],
        "properties": [],
    }

    # Extract command (usually at the beginning)
    command_words = ["generate", "create", "make", "design", "build"]
    words = text.lower().split()
    for word in command_words:
        if word in words:
            result["command"] = word
            break

    # Group entities by type
    for entity in entities:
        label = entity["label"]

        if label == "Shape":
            result["shape"] = entity["text"]
        elif label == "ShapeModifier":
            result["shape_modifiers"].append(entity["text"])
        elif label in ["Dimension", "Unit", "Property"]:
            result["dimensions"].append(
                {
                    "type": label,
                    "text": entity["text"],
                    "start": entity["start"],
                    "end": entity["end"],
                }
            )
        elif label == "Property":
            result["properties"].append(entity["text"])

    # Group dimensions with their units and properties
    result["structured_dimensions"] = group_dimension_triplets(
        result["dimensions"], text
    )

    return result


def group_dimension_triplets(dimensions: List[Dict], text: str) -> List[Dict]:
    """
    Group Dimension-Unit-Property triplets (e.g., "30 cm sides")
    """
    triplets = []
    used_indices = set()

    # Sort by position in text
    dimensions.sort(key=lambda x: x["start"])

    for i, dim in enumerate(dimensions):
        if i in used_indices or dim["type"] != "Dimension":
            continue

        triplet = {"value": dim["text"], "unit": None, "property": None}
        used_indices.add(i)

        # Look for unit and property near this dimension
        for j, other in enumerate(dimensions):
            if j in used_indices:
                continue

            # Check if entities are adjacent or very close
            distance = abs(dim["start"] - other["start"])
            if distance <= 15:  # Within 15 characters
                if other["type"] == "Unit":
                    triplet["unit"] = other["text"]
                    used_indices.add(j)
                elif other["type"] == "Property":
                    triplet["property"] = other["text"]
                    used_indices.add(j)

        triplets.append(triplet)

    return triplets


def advanced_cad_parser(entities: List[Dict], text: str) -> Dict[str, Any]:
    """
    Advanced parser specifically for CAD commands
    """
    result = {
        "action": extract_action(text),
        "object": {"type": None, "modifiers": [], "parameters": {}},
    }

    # Group entities by type
    by_type = defaultdict(list)
    for entity in entities:
        by_type[entity["label"]].append(entity)

    # Extract shape information
    if by_type["Shape"]:
        result["object"]["type"] = by_type["Shape"][0]["text"]

    if by_type["ShapeModifier"]:
        result["object"]["modifiers"] = [
            mod["text"] for mod in by_type["ShapeModifier"]
        ]

    # Parse parameters (dimensions with units and properties)
    result["object"]["parameters"] = parse_parameters(by_type, text)

    return result


def extract_action(text: str) -> str:
    """Extract the action verb from the command"""
    action_patterns = [r"\b(generate|create|make|design|build|draw|construct)\b"]

    for pattern in action_patterns:
        match = re.search(pattern, text.lower())
        if match:
            return match.group(1)

    return "create"  # default


def parse_parameters(entities_by_type: Dict, text: str) -> Dict[str, Any]:
    """
    Parse dimensional parameters into structured format
    """
    parameters = {}

    dimensions = entities_by_type["Dimension"]
    units = entities_by_type["Unit"]
    properties = entities_by_type["Property"]

    # Create position-sorted list of all relevant entities
    all_entities = dimensions + units + properties
    all_entities.sort(key=lambda x: x["start"])

    # Group consecutive dimension-unit-property sequences
    i = 0
    while i < len(all_entities):
        entity = all_entities[i]

        if entity["label"] == "Dimension":
            param_group = {
                "value": float(entity["text"])
                if entity["text"].replace(".", "").isdigit()
                else entity["text"]
            }

            # Look ahead for unit and property
            j = i + 1
            while j < len(all_entities) and j < i + 3:  # Look at next 2 entities max
                next_entity = all_entities[j]

                if next_entity["label"] == "Unit":
                    param_group["unit"] = next_entity["text"]
                elif next_entity["label"] == "Property":
                    param_group["property"] = next_entity["text"]

                j += 1

            # Use property as key, or generate generic key
            key = param_group.get("property", f"dimension_{len(parameters)}")
            parameters[key] = param_group

            i = j  # Skip processed entities
        else:
            i += 1

    return parameters


def rule_based_grouper(entities: List[Dict], text: str) -> Dict[str, Any]:
    """
    Rule-based grouper with specific patterns for common CAD shapes
    """
    # Define common patterns
    patterns = {
        "gear": {
            "required": ["Shape"],
            "optional": ["ShapeModifier"],
            "parameters": ["teeth", "module", "width"],
        },
        "cube": {"required": ["Shape"], "parameters": ["sides", "side", "edge"]},
        "cylinder": {
            "required": ["Shape"],
            "parameters": ["diameter", "radius", "height", "length"],
        },
        "sphere": {"required": ["Shape"], "parameters": ["radius", "diameter"]},
    }

    # Identify shape type
    shape_entities = [e for e in entities if e["label"] == "Shape"]
    if not shape_entities:
        return {"error": "No shape identified"}

    shape_type = shape_entities[0]["text"].lower()

    # Apply pattern-specific parsing
    if shape_type in patterns:
        return parse_with_pattern(entities, text, patterns[shape_type], shape_type)
    else:
        return advanced_cad_parser(entities, text)


def parse_with_pattern(
    entities: List[Dict], text: str, pattern: Dict, shape_type: str
) -> Dict[str, Any]:
    """
    Parse entities using a specific pattern
    """
    result = {
        "shape_type": shape_type,
        "modifiers": [],
        "parameters": {},
        "raw_entities": entities,
    }

    # Extract modifiers
    for entity in entities:
        if entity["label"] == "ShapeModifier":
            result["modifiers"].append(entity["text"])

    # Extract parameters based on pattern
    expected_params = pattern.get("parameters", [])

    # Group dimension-unit-property triplets
    triplets = extract_parameter_triplets(entities, text)

    for triplet in triplets:
        param_name = triplet.get("property", "unknown_parameter")
        result["parameters"][param_name] = {
            "value": triplet["value"],
            "unit": triplet.get("unit"),
        }

    return result


def extract_parameter_triplets(entities: List[Dict], text: str) -> List[Dict]:
    """
    Extract parameter triplets (value-unit-property) from entities
    """
    # Sort entities by position
    sorted_entities = sorted(entities, key=lambda x: x["start"])

    triplets = []
    i = 0

    while i < len(sorted_entities):
        entity = sorted_entities[i]

        if entity["label"] == "Dimension":
            triplet = {"value": entity["text"]}

            # Look for adjacent unit and property
            for j in range(i + 1, min(i + 4, len(sorted_entities))):
                next_entity = sorted_entities[j]

                # Check if entities are close enough (within reasonable distance)
                if next_entity["start"] - entity["end"] > 10:
                    break

                if next_entity["label"] == "Unit" and "unit" not in triplet:
                    triplet["unit"] = next_entity["text"]
                elif next_entity["label"] == "Property" and "property" not in triplet:
                    triplet["property"] = next_entity["text"]

            triplets.append(triplet)

        i += 1

    return triplets


# Example usage and testing
def test_grouping():
    # Your example data
    entities = [
        {"start": 11, "end": 15, "label": "Shape", "text": "cube"},
        {"start": 21, "end": 23, "label": "Dimension", "text": "30"},
        {"start": 24, "end": 26, "label": "Unit", "text": "cm"},
        {"start": 27, "end": 32, "label": "Property", "text": "sides"},
    ]
    text = "Generate a cube with 30 cm sides"

    print("=== Semantic Grouping ===")
    semantic_result = group_entities_semantic(entities, text)
    print(semantic_result)

    print("\n=== Advanced CAD Parser ===")
    advanced_result = advanced_cad_parser(entities, text)
    print(advanced_result)

    print("\n=== Rule-based Grouper ===")
    rule_result = rule_based_grouper(entities, text)
    print(rule_result)


if __name__ == "__main__":
    test_grouping()

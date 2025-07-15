from typing import Literal, Optional, Tuple, List, Union

from pydantic import BaseModel, Field, Discriminator
from typing_extensions import Annotated


class BaseHole(BaseModel):
    @staticmethod
    def get_corner_offset_position(parent_dimensions: Tuple[float, float], offset: float, hole_index: int) -> Tuple[
        float, float]:
        length, width = parent_dimensions

        hole_positions = [
            (length / 2 - offset, width / 2 - offset),
            (-length / 2 + offset, width / 2 - offset),
            (-length / 2 + offset, -width / 2 + offset),
            (length / 2 - offset, -width / 2 + offset),
        ]

        return hole_positions[hole_index]


class CircularHole(BaseHole):
    type: Literal["circular_hole"] = "circular_hole"
    diameter: float = Field(..., gt=0)
    depth: Optional[float] = None
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"

    @staticmethod
    def create(position: Tuple[float, float], diameter: float):
        return CircularHole(
            position=position,
            diameter=diameter,
            depth=None,
            face=">Z"
        )


class RectangularHole(BaseModel):
    type: Literal["rectangular_hole"] = "rectangular_hole"
    width: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    depth: Optional[float] = None
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class CounterboreHole(BaseModel):
    type: Literal["counterbore_hole"] = "counterbore_hole"
    hole_diameter: float = Field(..., gt=0)
    counterbore_diameter: float = Field(..., gt=0)
    counterbore_depth: float = Field(..., gt=0)
    total_depth: float = Field(..., gt=0)
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class CountersunkHole(BaseModel):
    type: Literal["countersunk_hole"] = "countersunk_hole"
    hole_diameter: float = Field(..., gt=0)
    countersink_diameter: float = Field(..., gt=0)
    countersink_angle: float = Field(..., gt=0)
    total_depth: float = Field(..., gt=0)
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class ThreadedHole(BaseModel):
    type: Literal["threaded_hole"] = "threaded_hole"
    nominal_diameter: float = Field(..., gt=0)
    pitch: float = Field(..., gt=0)
    depth: Optional[float] = None
    thread_class: Literal["6H", "6G", "4H", "5G"] = "6H"
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class Slot(BaseModel):
    type: Literal["slot"] = "slot"
    length: float = Field(..., gt=0)
    width: float = Field(..., gt=0)
    depth: Optional[float] = None
    position: Tuple[float, float] = (0, 0)
    angle: float = 0
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class Pocket(BaseModel):
    type: Literal["pocket"] = "pocket"
    length: float = Field(..., gt=0)
    width: float = Field(..., gt=0)
    depth: float = Field(..., gt=0)
    corner_radius: float = Field(0, ge=0)
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class Boss(BaseModel):
    type: Literal["boss"] = "boss"
    diameter: float = Field(..., gt=0)
    height: float = Field(..., gt=0)
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


class Rib(BaseModel):
    type: Literal["rib"] = "rib"
    profile_points: List[Tuple[float, float]]
    height: float = Field(..., gt=0)
    thickness: float = Field(..., gt=0)
    draft_angle: float = Field(0, ge=-45, le=45)
    position: Tuple[float, float] = (0, 0)
    face: Literal[">Z", "<Z", ">Y", "<Y", ">X", "<X"] = ">Z"


FeatureUnion = Annotated[
    Union[
        CircularHole,
        RectangularHole,
        CounterboreHole,
        CountersunkHole,
        ThreadedHole,
        Slot,
        Pocket,
        Boss,
        Rib,
    ],
    Discriminator("type"),
]

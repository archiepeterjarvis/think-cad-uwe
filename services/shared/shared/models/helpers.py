from shared.models.base import Shape, BoxParameters
from shared.models.features import FeatureUnion


def create_box(
    length: float,
    width: float,
    height: float,
    centered: bool,
    features: list[FeatureUnion] = None,
    **kwargs,
) -> Shape:
    return Shape(
        type="box",
        parameters=BoxParameters(
            type="box",
            length=length,
            width=width,
            height=height,
            centered=centered,
            features=features,
        ),
        **kwargs,
    )

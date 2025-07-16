import erdantic as erd

from shared.models.base import CADConfiguration

erd.draw(CADConfiguration, out="diagram.png")
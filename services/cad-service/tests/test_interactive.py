import asyncio
import json
import unittest

from cadquery.vis import show_object

from processor import CADProcessor
from processor.utils.mapping import CADMapper
from shared.models.misc import Entity


class InteractiveTestCases(unittest.TestCase):
    def setUp(self):
        self.processor = CADProcessor()
        self.mapper = CADMapper()

    def test_mounting_plate(self):
        with open("./data/mounting_plate.json", "r") as file:
            ents = json.load(file)

        ents = [Entity.model_validate(item) for item in ents]

        config = self.mapper.get_configuration(ents)
        result = asyncio.run(self.processor.process_configuration(config))

        show_object(result)

import logging

import spacy

from shared.models.misc import Entity

logger = logging.getLogger(__name__)


class SpacyNERModel:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.nlp = None

    def load_model(self):
        """Load the trained SpaCy model."""
        try:
            logger.info(f"Loading SpaCy model from {self.model_path}")
            self.nlp = spacy.load(self.model_path)
            logger.info(
                f"Model loaded successfully. Labels {self.nlp.get_pipe('ner').labels}"
            )
        except OSError as e:
            logger.error(f"Failed to load SpaCy model from {self.model_path}: {e}")

    def predict(self, prompt: str) -> list[Entity]:
        """
        Predict named entities in the given prompt using the loaded SpaCy model.

        Args:
            prompt: The prompt to extract entities from.

        Returns:
            A list of dictionaries containing the entities found in the prompt.
        """
        if self.nlp is None:
            logger.error("Model not loaded. Call load_model() before predict().")
            return []

        doc = self.nlp(prompt)
        entities = []
        for ent in doc.ents:
            entities.append(
                Entity(
                    start=ent.start_char,
                    end=ent.end_char,
                    label=ent.label_,
                    text=ent.text,
                )
            )
        return entities

    def get_model_info(self) -> dict:
        """Get model metadata."""
        if not self.nlp:
            return {"error": "Model not loaded."}

        return {
            "model_name": self.nlp.meta.get("name", "Unknown"),
            "version": self.nlp.meta.get("version", "Unknown"),
            "language": self.nlp.meta.get("lang", "Unknown"),
            "labels": list(self.nlp.get_pipe("ner").labels),
            "pipeline": self.nlp.pipe_names,
        }

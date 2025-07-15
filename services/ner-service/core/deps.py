from functools import lru_cache

from core.settings import settings
from models.spacy_ner import SpacyNERModel


@lru_cache()
def get_ner_model() -> SpacyNERModel:
    """Get the NER model from the cache or load it if not cached."""
    model = SpacyNERModel(settings.NER_MODEL_PATH)
    model.load_model()
    return model

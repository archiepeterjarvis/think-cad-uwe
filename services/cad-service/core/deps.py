from functools import lru_cache

from processor import CADProcessor


@lru_cache
def get_cad_processor() -> CADProcessor:
    """Get the CAD processor from the cache or load it if not cached."""
    processor = CADProcessor()
    return processor

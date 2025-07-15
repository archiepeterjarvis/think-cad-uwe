import re
from collections import defaultdict
from typing import Any

import spacy

nlp = spacy.load("./training/ner_model")


def predict(text):
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append(
            {
                "start": ent.start_char,
                "end": ent.end_char,
                "label": ent.label_,
                "text": ent.text,
            }
        )
    return {"text": text, "entities": entities}


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) != 2:
        print("Usage: python inference.py '<text>'")
        sys.exit(1)

    input_text = sys.argv[1]
    result = predict(input_text)

    print(json.dumps(result, indent=2, ensure_ascii=False))

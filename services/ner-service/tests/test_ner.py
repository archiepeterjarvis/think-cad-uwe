from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from main import app
from core.deps import get_ner_model

client = TestClient(app)

def override_ner_model(predict_return):
    mock_model = MagicMock()
    mock_model.predict.return_value = predict_return
    app.dependency_overrides[get_ner_model] = lambda: mock_model


def test_extract_entities_success():
    """Test successful entity extraction."""
    override_ner_model([
        {"start": 0, "end": 6, "label": "SHAPE", "text": "circle"}
    ])

    response = client.post("/api/v1/extract", json={"prompt": "Draw a circle with radius 5"})
    assert response.status_code == 200
    data = response.json()

    assert data["entities"] == [{"start": 0, "end": 6, "label": "SHAPE", "text": "circle"}]
    assert data["error"] is None


def test_extract_entities_empty():
    """Test when no entities are extracted."""
    override_ner_model([])

    response = client.post("/api/v1/extract", json={"prompt": "Blah blah"})
    assert response.status_code == 200
    data = response.json()

    assert data["entities"] is None or data["entities"] == []
    assert data["error"] == "No entities found"


def test_extract_entities_invalid_payload():
    """Test when the request payload is invalid (missing 'prompt')."""
    response = client.post("/api/v1/extract", json={})
    assert response.status_code == 422  # Unprocessable Entity

    # Optionally assert validation error structure
    errors = response.json()["detail"]
    assert any(err["loc"][-1] == "prompt" for err in errors)

from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from core.deps import get_client_factory
from main import app


def test_pipeline_success():
    mock_get_client_factory = MagicMock()

    mock_nlp_client = MagicMock()
    mock_nlp_client.extract_entities.return_value = {
        "entities": [{"type": "shape", "value": "rectangle", "dimensions": [10, 5]}]
    }

    mock_cad_client = MagicMock()
    mock_cad_client.generate_geometry.return_value = MagicMock(model_path="/fake/path/to/model.stl")

    mock_get_client_factory.return_value.get_nlp_client.return_value = mock_nlp_client
    mock_get_client_factory.return_value.get_cad_client.return_value = mock_cad_client

    app.dependency_overrides[get_client_factory] = lambda: mock_get_client_factory()

    client = TestClient(app)

    response = client.post("/api/v1/pipeline", json={"prompt": "Draw a rectangle 10x5"})

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "Orchestrator pipeline completed"
    assert data["file_path"] == "/fake/path/to/model.stl"

    app.dependency_overrides = {}


def test_pipeline_missing_prompt():
    client = TestClient(app)
    response = client.post("/api/v1/pipeline", json={})  # no prompt key
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    

def test_pipeline_ner_client_failure():
    mock_get_client_factory = MagicMock()
    mock_nlp_client = MagicMock()
    mock_nlp_client.extract_entities.side_effect = Exception("NER service failed")
    mock_cad_client = MagicMock()

    mock_get_client_factory.return_value.get_nlp_client.return_value = mock_nlp_client
    mock_get_client_factory.return_value.get_cad_client.return_value = mock_cad_client

    app.dependency_overrides[get_client_factory] = lambda: mock_get_client_factory()

    client = TestClient(app)
    response = client.post("/api/v1/pipeline", json={"prompt": "test prompt"})

    assert response.status_code == 200  # endpoint returns 200 even on internal error
    data = response.json()
    assert data["status"] == "error"
    assert "NER service failed" in data["message"]

    app.dependency_overrides = {}


def test_pipeline_cad_client_failure():
    mock_get_client_factory = MagicMock()
    mock_nlp_client = MagicMock()
    mock_nlp_client.extract_entities.return_value = {"entities": []}

    mock_cad_client = MagicMock()
    mock_cad_client.generate_geometry.side_effect = Exception("CAD service failed")

    mock_get_client_factory.return_value.get_nlp_client.return_value = mock_nlp_client
    mock_get_client_factory.return_value.get_cad_client.return_value = mock_cad_client

    app.dependency_overrides[get_client_factory] = lambda: mock_get_client_factory()

    client = TestClient(app)
    response = client.post("/api/v1/pipeline", json={"prompt": "test prompt"})

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "CAD service failed" in data["message"]

    app.dependency_overrides = {}


def test_health_check_success():
    mock_get_client_factory = MagicMock()

    # Each service client returns healthy True
    mock_client = MagicMock()
    mock_client.health_check.return_value = True

    # Configure factory to have two services for example
    mock_get_client_factory.return_value.configs = {"nlp": {}, "cad": {}}
    mock_get_client_factory.return_value.get_nlp_client.return_value = mock_client
    mock_get_client_factory.return_value.get_cad_client.return_value = mock_client

    app.dependency_overrides[get_client_factory] = lambda: mock_get_client_factory()

    client = TestClient(app)
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Orchestrator service is running" in data["message"]

    app.dependency_overrides = {}

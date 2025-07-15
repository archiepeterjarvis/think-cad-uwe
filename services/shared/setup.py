from setuptools import setup, find_packages

setup(
    name="shared",
    version="0.1.0-dev",
    packages=find_packages(),
    install_requires=[
        "python-jose>=3.5.0",
        "fastapi>=0.115.12",
        "pydantic>=2.11.5",
        "opentelemetry-sdk>=1.34.1",
        "opentelemetry-instrumentation-fastapi>=0.55b1",
        "opentelemetry-api>=1.34.1",
        "prometheus-fastapi-instrumentator>=7.1.0",
        "opentelemetry-instrumentation-requests>=0.55b1",
        "requests>=2.32.4",
    ],
    python_requires=">=3.10",
)

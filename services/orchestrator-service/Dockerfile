FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --force-reinstall -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
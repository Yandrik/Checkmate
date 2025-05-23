FROM mcr.microsoft.com/devcontainers/python:3
RUN pip install --upgrade pip uv
COPY backend/requirements.txt /tmp/requirements.txt
RUN uv pip install --no-cache-dir -r /tmp/requirements.txt --system
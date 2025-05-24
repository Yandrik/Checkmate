FROM ghcr.io/astral-sh/uv:python3.12-alpine AS builder
WORKDIR /builder
RUN apk update && apk add --no-cache unixodbc unixodbc-dev gcc g++ linux-headers python3-dev py3-psutil musl-dev
COPY pyproject.toml .
RUN uv sync
FROM ghcr.io/astral-sh/uv:python3.12-alpine
WORKDIR /app
COPY --from=builder /builder/.venv /app/.venv
COPY *.py .
COPY *.txt .
EXPOSE 8000
ENTRYPOINT ["uv", "run", "main.py" ]
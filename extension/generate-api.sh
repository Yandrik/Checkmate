#!/bin/bash
(cd ../backend && uv sync && uv run litestar  --app main:app schema openapi)
pnpx openapi-typescript ../backend/openapi_schema.json --output src/lib/backend-api.ts

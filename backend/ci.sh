#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "🔄 Running code formatter && linter (ruff)..."
if [ "$1" == "--fix" ]; then
  uv run ruff check --fix
else
  uv run ruff check
fi

echo "🔍 Running type checker (Mypy)..."
uv run mypy .

echo "🧪 Running tests (Pytest)..."
uv run pytest

echo "✅ All checks passed!"

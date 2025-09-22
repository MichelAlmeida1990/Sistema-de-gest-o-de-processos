#!/bin/bash
exec /app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT

#!/bin/sh
set -e

echo "Creation des tables (si elles n'existent pas deja)..."
python init_db.py

echo "Demarrage du serveur..."
exec uvicorn main:app --host 0.0.0.0 --port 8000

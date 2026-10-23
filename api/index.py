"""
REET Vercel Serverless Function Entrypoint
Routes all incoming /api/* requests directly into the FastAPI application.
Normalizes paths whether Vercel passes `/api/v1/...` or strips `/api` to `/v1/...`.
"""

import sys
import os
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

# Ensure project root is in sys.path for apps.* and packages.* resolution
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from apps.api.main import app

class VercelPathNormalizer(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.scope.get("path", "")
        if path.startswith("/v1/") or path == "/health":
            request.scope["path"] = f"/api{path}"
        elif path.startswith("/api/index.py"):
            normalized = path.replace("/api/index.py", "")
            if not normalized.startswith("/api"):
                normalized = "/api" + normalized
            request.scope["path"] = normalized
        return await call_next(request)

app.add_middleware(VercelPathNormalizer)

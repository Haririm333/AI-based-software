"""
REET Vercel Serverless Function Entrypoint
Routes all incoming /api/* requests directly into the FastAPI application.
"""

import sys
import os

# Ensure project root is in sys.path for apps.* and packages.* resolution
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from apps.api.main import app

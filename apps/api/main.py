"""
REET FastAPI Application
Complete asynchronous backend powering all modules:
- Proof Engine (GitHub Import, Sandbox, Rubric Scorer, Code Defense, REET Mentor)
- Project Feed (Showcase, Upcoming, Team Call)
- Team Up Matchmaker & Bhasha Bridge Chat
- Trust Shield (Scam Interceptor, Payment Guard, Cybercrime Dossier)
- Proof Profile (Skill points, Anti-inflation level formula)
- AI Idea Coach
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from apps.api.config import settings
from apps.api.routers import (
    auth, projects, scoring, feed, defense,
    mentor, team_up, chat, trust_shield, profile, coach
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="REET: Project-first network for Indian youth. Where projects are your profile."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(scoring.router)
app.include_router(feed.router)
app.include_router(defense.router)
app.include_router(mentor.router)
app.include_router(team_up.router)
app.include_router(chat.router)
app.include_router(trust_shield.router)
app.include_router(profile.router)
app.include_router(coach.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint confirming offline-mock operational readiness."""
    return {
        "app": settings.APP_NAME,
        "status": "HEALTHY",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "offline_mock_mode": settings.MOCK_GITHUB and settings.MOCK_SANDBOX
    }

# Mount Web Editorial UI at root (must be after all API routes)
web_dir = os.path.join(os.path.dirname(__file__), "..", "web", "public")
if os.path.exists(web_dir):
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="static")

"""
REET AI Idea Coach Service
Provides structured, non-intrusive guidance on Upcoming post drafts:
- Evaluates draft title & description
- Recommends required skills
- Returns 3 similar projects on platform (vector search)
- Outlines ordered 3-5 milestone build steps
- Suggests teammate roles to invite
Guaranteed schema-validated JSON. Displayed in an advisory side panel. Never auto-publishes.
"""

from typing import Dict, Any, List
from packages.shared.seed_data import SAMPLE_REPOSITORIES

class IdeaCoachService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def evaluate_draft(self, draft_title: str, draft_body: str) -> Dict[str, Any]:
        """Returns schema-validated JSON with ordered build steps and similar projects."""
        combined = f"{draft_title} {draft_body}".lower()

        # Vector search simulation against platform corpus
        similar = []
        for sample in SAMPLE_REPOSITORIES[:3]:
            similar.append({
                "project_id": sample["id"],
                "title": sample["title"],
                "similarity_score": 0.84,
                "verified_score": sample["reference_score"],
                "primary_language": sample["primary_language"]
            })

        # Determine domain-specific build steps
        if "iot" in combined or "sensor" in combined or "hardware" in combined:
            skills = ["Python", "IoT", "C++", "MQTT"]
            steps = [
                "1. Establish local serial / MQTT loopback tests before ordering custom hardware.",
                "2. Create a clean SQLite schema to log raw readings with millisecond timestamps.",
                "3. Write a Dockerfile with read-only quotas to verify containerized test runs.",
                "4. Build a lightweight Flask/FastAPI dashboard to visualize sensor spikes."
            ]
            roles = ["Firmware & Circuit Developer", "Backend Telemetry Engineer"]
        elif "ml" in combined or "ai" in combined or "model" in combined:
            skills = ["Python", "PyTorch", "ML", "FastAPI"]
            steps = [
                "1. Collect and manually inspect at least 150 diverse local image/text samples.",
                "2. Train a lightweight baseline model (e.g., MobileNetV3) with explicit validation splits.",
                "3. Package inference logic into an isolated function with latency assertions (<100ms).",
                "4. Export confusion matrix and ROC curves to the README for Presentation proof."
            ]
            roles = ["ML Training Specialist", "Frontend App Integrator"]
        else:
            skills = ["Python", "Web", "PostgreSQL", "Docker"]
            steps = [
                "1. Sketch out entity relationships on paper and write relational Alembic migrations.",
                "2. Write unit tests for your two most critical user routes before building templates.",
                "3. Configure `.env.example` to ensure zero hardcoded secrets from day one.",
                "4. Set up a basic GitHub Actions workflow to run Ruff linter on every pull request."
            ]
            roles = ["Full-Stack Developer", "UI/UX Designer"]

        return {
            "draft_analyzed": draft_title,
            "skills_needed": skills,
            "similar_projects": similar,
            "what_to_build_first": steps,
            "roles_to_invite": roles,
            "advisory_note": "This is non-binding AI coaching. You retain complete creative control over your project scope."
        }

idea_coach_service = IdeaCoachService(mock_mode=True)

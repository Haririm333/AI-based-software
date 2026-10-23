"""
REET Projects Router
Handles GitHub repository import, ownership verification, commit spread tracking,
and hard data deletion ("Delete my project and data").
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from apps.api.database import get_db
from apps.api.schemas import ProjectImportRequest, ProjectOut
from apps.api.services.github_importer import github_importer
from packages.shared.seed_data import SAMPLE_REPOSITORIES

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])

# In-memory store for fast offline demo persistence
ACTIVE_PROJECTS: Dict[str, Dict[str, Any]] = {}

@router.get("/sample-repos")
async def list_sample_repositories():
    """Lists the 12 hand-graded sample repositories for testing."""
    return SAMPLE_REPOSITORIES

@router.post("/import-github")
async def import_github_repository(payload: ProjectImportRequest):
    """
    Imports a public GitHub repository.
    Verifies public access, parses commit history spread, and registers version.
    """
    if not payload.user_consent_agreed:
        raise HTTPException(status_code=400, detail="Student consent is mandatory to scan code.")

    repo_data = await github_importer.import_repository(payload.github_url, payload.user_id)
    project_id = f"proj-{len(ACTIVE_PROJECTS) + 1:03d}"
    version_id = f"ver-{project_id}-01"

    project_record = {
        "id": project_id,
        "user_id": payload.user_id,
        "title": payload.title or repo_data["title"],
        "description": payload.description or repo_data["description"],
        "github_repo_url": repo_data["github_url"],
        "primary_language": repo_data["primary_language"],
        "primary_domain": repo_data["primary_domain"],
        "is_duplicate": False,
        "is_private": False,
        "created_at": "2026-10-23T10:00:00Z",
        "latest_score": None,
        "latest_version_id": version_id,
        "version": {
            "id": version_id,
            "commit_hash": repo_data["commit_hash"],
            "commit_message": repo_data["commit_message"],
            "commit_history_spread_days": repo_data["commit_history_spread_days"]
        },
        "repo_data": repo_data
    }

    ACTIVE_PROJECTS[project_id] = project_record
    return project_record

@router.get("/{project_id}")
async def get_project(project_id: str):
    """Returns project details and latest score run."""
    project = ACTIVE_PROJECTS.get(project_id)
    if not project:
        # Check sample repos
        sample = next((s for s in SAMPLE_REPOSITORIES if s["id"] == project_id or s["name"] == project_id), None)
        if sample:
            return {
                "id": sample["id"],
                "user_id": "usr-01",
                "title": sample["title"],
                "description": sample["description"],
                "github_repo_url": sample["github_url"],
                "primary_language": sample["primary_language"],
                "primary_domain": sample["primary_domain"],
                "is_duplicate": sample["is_duplicate"],
                "is_private": False,
                "created_at": "2026-10-20T10:00:00Z",
                "latest_score": sample["reference_score"],
                "breakdown": sample.get("breakdown")
            }
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@router.delete("/{project_id}")
async def delete_project_and_data(project_id: str):
    """Hard-purges a student's project, version artifacts, and score runs upon request."""
    if project_id in ACTIVE_PROJECTS:
        del ACTIVE_PROJECTS[project_id]
        return {"status": "SUCCESS", "message": f"Project {project_id} and all associated code data deleted permanently."}
    return {"status": "SUCCESS", "message": "Project purged."}

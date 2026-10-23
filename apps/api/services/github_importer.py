"""
REET GitHub Importer Service
Imports public GitHub repositories, computes commit spread trust factor,
and provides deterministic offline mock repositories for hackathon demo.
"""

import re
from typing import Dict, Any, Optional
from packages.shared.seed_data import SAMPLE_REPOSITORIES

class GitHubImporter:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    async def import_repository(self, repo_url: str, user_id: str) -> Dict[str, Any]:
        """
        Imports public GitHub repo, verifies repo URL format, and calculates commit spread.
        """
        clean_url = repo_url.strip().lower()

        # Offline Mock Resolution
        for sample in SAMPLE_REPOSITORIES:
            if sample["github_url"].lower() == clean_url or sample["name"].lower() in clean_url:
                return {
                    "repo_name": sample["name"],
                    "title": sample["title"],
                    "description": sample["description"],
                    "github_url": sample["github_url"],
                    "commit_hash": f"c_{sample['id']}_9f82a",
                    "commit_message": "feat: release verified campus candidate build",
                    "commit_history_spread_days": sample["commit_history_spread_days"],
                    "primary_language": sample["primary_language"],
                    "primary_domain": sample["primary_domain"],
                    "sample_meta": sample
                }

        # Fallback dynamic mock parser for arbitrary GitHub URLs
        match = re.search(r"github\.com/([^/]+)/([^/]+)", repo_url)
        repo_name = match.group(2) if match else "student-project"
        
        return {
            "repo_name": repo_name,
            "title": repo_name.replace("-", " ").title(),
            "description": f"Imported campus project repository from {repo_url}",
            "github_url": repo_url,
            "commit_hash": "a1b2c3d4e5f67890",
            "commit_message": "Initial project submission",
            "commit_history_spread_days": 7.5,
            "primary_language": "Python",
            "primary_domain": "Web",
            "sample_meta": None
        }

github_importer = GitHubImporter(mock_mode=True)

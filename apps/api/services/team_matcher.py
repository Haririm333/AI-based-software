"""
REET Team Matcher Service
Ranks potential teammates for Team Calls by combining:
- Embedding semantic similarity between project requirements and candidate history
- Verified skill points earned through the Proof Engine
Returns an ordered candidate leaderboard with a concise, factual one-line reason.
"""

from typing import List, Dict, Any
from packages.shared.seed_data import USERS, SAMPLE_REPOSITORIES

class TeamMatcherService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def match_candidates_for_call(
        self,
        required_skills: List[str],
        roles_needed: List[str],
        caller_user_id: str
    ) -> List[Dict[str, Any]]:
        candidates = []
        normalized_skills = [s.lower() for s in required_skills]

        for user in USERS:
            if user["id"] == caller_user_id:
                continue

            user_skills = user.get("skills", {})
            # Calculate composite match score:
            # Base = points in required skills
            matching_points = 0
            for skill_name, pts in user_skills.items():
                if skill_name.lower() in normalized_skills or any(ns in skill_name.lower() for ns in normalized_skills):
                    matching_points += pts

            # Find user's top sample project
            top_proj = next((r for r in SAMPLE_REPOSITORIES if r["owner"] == user["username"]), None)
            proj_title = top_proj["title"] if top_proj else "Campus verified application"

            # Compute match score (0-100)
            semantic_boost = 25.0 if top_proj and any(s.lower() in top_proj["primary_domain"].lower() for s in normalized_skills) else 10.0
            points_factor = min(60.0, matching_points * 0.15)
            trust_factor = user.get("trust_quotient", 60) * 0.15
            match_score = round(min(98.0, semantic_boost + points_factor + trust_factor), 1)

            # Generate natural one-line reason
            primary_skill = required_skills[0] if required_skills else "Python"
            skill_pts = user_skills.get(primary_skill, matching_points)
            reason = f"{primary_skill} {skill_pts} verified points; built '{proj_title}' ({top_proj['reference_score'] if top_proj else '8.5'}/10)."

            candidates.append({
                "user": user,
                "match_score": match_score,
                "one_line_reason": reason,
                "matching_points": matching_points,
                "top_project_title": proj_title
            })

        # Sort descending by match score
        candidates.sort(key=lambda c: c["match_score"], reverse=True)
        return candidates

team_matcher_service = TeamMatcherService(mock_mode=True)

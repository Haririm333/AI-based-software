"""
REET Team Up Router
Matches and ranks teammates for Team Calls, sends invites, and automatically provisions group chats.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from apps.api.services.team_matcher import team_matcher_service
from apps.api.routers.feed import STORED_POSTS
from packages.shared.seed_data import USERS

router = APIRouter(prefix="/api/v1/team-up", tags=["Team Up"])

# In-memory collaborative groups store
COLLAB_GROUPS: List[Dict[str, Any]] = [
    {
        "id": "grp-01",
        "name": "Wayanad Coffee Logistics App Team",
        "origin_team_call_id": "post-04",
        "members": ["usr-04", "usr-01"],
        "messages": [
            {"sender_id": "usr-04", "sender_name": "Kavya Menon", "text": "Welcome to the team! Our Django backend is ready at 8.5/10.", "time": "10:15 AM"},
            {"sender_id": "usr-01", "sender_name": "Hariram S.", "text": "Glad to join! I can build the offline SQLite sync layer.", "time": "10:18 AM"}
        ]
    }
]

@router.get("/match/{post_id}")
async def match_candidates_for_call(post_id: str):
    """Ranks candidates by skill points and embedding similarity."""
    post = next((p for p in STORED_POSTS if p["id"] == post_id), None)
    if not post:
        # Fallback to general skills if ad-hoc post
        required = ["Python", "Web"]
        caller_id = "usr-01"
    else:
        required = post.get("skills_required", ["Python"])
        caller_id = post.get("user_id", "usr-01")

    candidates = team_matcher_service.match_candidates_for_call(
        required_skills=required,
        roles_needed=post.get("roles_needed", []) if post else [],
        caller_user_id=caller_id
    )

    return {
        "post_id": post_id,
        "required_skills": required,
        "candidates": candidates
    }

@router.post("/invite")
async def send_team_invite(payload: Dict[str, str]):
    """Sends invitation to a matched candidate."""
    candidate_id = payload.get("candidate_id")
    post_id = payload.get("post_id")
    return {
        "status": "INVITED",
        "candidate_id": candidate_id,
        "post_id": post_id,
        "message": "Teammate invitation dispatched. Once accepted, a private workspace group chat will be created."
    }

@router.post("/accept")
async def accept_team_invite(payload: Dict[str, str]):
    """Accepts invite and automatically provisions collaborative group chat."""
    inviter_id = payload.get("inviter_id", "usr-04")
    candidate_id = payload.get("candidate_id", "usr-01")
    post_id = payload.get("post_id", "post-04")

    inviter = next((u for u in USERS if u["id"] == inviter_id), USERS[0])
    candidate = next((u for u in USERS if u["id"] == candidate_id), USERS[1])

    new_group = {
        "id": f"grp-{len(COLLAB_GROUPS) + 1:02d}",
        "name": f"Collaboration: {inviter['full_name']} & {candidate['full_name']}",
        "origin_team_call_id": post_id,
        "members": [inviter_id, candidate_id],
        "messages": [
            {
                "sender_id": inviter_id,
                "sender_name": inviter["full_name"],
                "text": "Thanks for teaming up! Excited to build together.",
                "time": "Just now"
            }
        ]
    }
    COLLAB_GROUPS.append(new_group)

    return {
        "status": "ACCEPTED",
        "group_id": new_group["id"],
        "group": new_group
    }

"""
REET Feed Router
Manages the Home Feed supporting:
- Three distinct tabs: Following, For You (ranked recommendations), Team Calls
- Rising projects strip (GET /feed/rising)
- Keyset pagination with cursor
- Safety gate (filters Red/duplicate/pending posts)
- Social reactions (likes capped in formula, comments, saves)
- Feed impressions and "not interested" hide signals
"""

from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import base64
import json

from packages.shared.seed_data import FEED_POSTS, USERS
from apps.api.services.feed_ranker import feed_ranker_service
from apps.api.services.feed_cache import feed_cache_service
from apps.api.services.rising_calculator import rising_calculator_service

router = APIRouter(prefix="/api/v1/feed", tags=["Feed"])

# Mutable in-memory post storage initialized from seed data
STORED_POSTS: List[Dict[str, Any]] = [dict(p) for p in FEED_POSTS]

# Default Following Graph: user -> set of followed user_ids
FOLLOWING_GRAPH: Dict[str, set] = {
    "usr-01": {"usr-02", "usr-04", "usr-06", "usr-08"},
    "usr-02": {"usr-01", "usr-03", "usr-07"},
    "usr-03": {"usr-01", "usr-05", "usr-09"},
    "usr-04": {"usr-01", "usr-06", "usr-14"}
}

PAGE_SIZE = 6

def encode_cursor(index: int) -> str:
    """Encodes next item offset index into an opaque base64 cursor."""
    raw = json.dumps({"offset": index})
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8")

def decode_cursor(cursor_str: Optional[str]) -> int:
    """Decodes opaque cursor into an offset index, returning 0 if invalid or None."""
    if not cursor_str:
        return 0
    try:
        raw = base64.urlsafe_b64decode(cursor_str.encode("utf-8")).decode("utf-8")
        data = json.loads(raw)
        return max(0, int(data.get("offset", 0)))
    except Exception:
        return 0

@router.get("")
@router.get("/posts")
async def list_feed(
    tab: str = Query("forYou", description="following, forYou, teamCalls"),
    cursor: Optional[str] = Query(None, description="Opaque keyset pagination cursor"),
    min_score: Optional[float] = Query(None, description="Filter minimum verified score (e.g. 6.0, 8.0)"),
    skill: Optional[str] = Query(None, description="Filter by skill, e.g. Python, ML, Web"),
    post_type: Optional[str] = Query(None, description="Filter by SHOWCASE, UPCOMING, TEAM_CALL"),
    viewer_id: Optional[str] = Query("usr-01", description="Current viewer user ID")
):
    """
    Returns keyset paginated feed cards based on active tab and filters.
    Applies safety gate, ranking, and hides.
    """
    # Normalize parameters if called directly in tests
    tab_val = tab if isinstance(tab, str) else "forYou"
    cursor_val = cursor if isinstance(cursor, str) else None
    min_score_val = float(min_score) if isinstance(min_score, (int, float)) else None
    skill_val = skill if isinstance(skill, str) else None
    post_type_val = post_type if isinstance(post_type, str) else None
    viewer_id_val = viewer_id if isinstance(viewer_id, str) else "usr-01"

    offset = decode_cursor(cursor_val)

    # 1. Gather viewer profile and interests
    viewer = next((u for u in USERS if u["id"] == viewer_id_val), USERS[0])
    viewer_skills = list(viewer.get("skills", {}).keys()) if viewer else []
    followed_creators = FOLLOWING_GRAPH.get(viewer_id_val, set())

    # 2. Filter posts by active Tab
    if tab_val.lower() == "following":
        candidate_posts = [p for p in STORED_POSTS if p.get("user_id") in followed_creators]
        # Sort newest first for following tab
        candidate_posts.sort(key=lambda x: x.get("id", ""), reverse=True)
    elif tab_val.lower() == "teamcalls":
        candidate_posts = [p for p in STORED_POSTS if p.get("post_type") == "TEAM_CALL"]
        # Order by skill match against viewer, then recency
        def team_call_sort_key(p):
            needed = set(s.lower() for s in (p.get("skills_required") or []))
            matches = len(needed.intersection(set(s.lower() for s in viewer_skills)))
            return matches
        candidate_posts.sort(key=team_call_sort_key, reverse=True)
    else:  # forYou tab (Default)
        candidate_posts = feed_ranker_service.rank_for_you_feed(
            STORED_POSTS,
            viewer_skills=viewer_skills,
            viewer_id=viewer_id_val
        )

    # 3. Apply Safety Gate to ensure Red/Duplicate/Pending never appear
    safe_posts = [p for p in candidate_posts if feed_ranker_service.passes_safety_gate(p)]

    # 4. Filter out user hide signals
    visible_posts = [
        p for p in safe_posts
        if not feed_cache_service.is_hidden(viewer_id_val, p.get("user_id", ""), p.get("skills", []))
    ]

    # 5. Apply user filters (min_score, skill, post_type)
    filtered_posts = visible_posts
    if post_type_val and post_type_val.upper() != "ALL":
        filtered_posts = [p for p in filtered_posts if p.get("post_type") == post_type_val.upper()]

    if min_score_val is not None:
        filtered_posts = [p for p in filtered_posts if (p.get("score") is not None and p.get("score") >= min_score_val)]

    if skill_val and skill_val.upper() != "ALL":
        skill_lower = skill_val.lower()
        filtered_posts = [
            p for p in filtered_posts
            if any(skill_lower in s.lower() for s in (p.get("skills") or p.get("skills_required") or []))
        ]

    # 6. Apply Keyset Pagination
    total = len(filtered_posts)
    page_items = filtered_posts[offset : offset + PAGE_SIZE]
    next_offset = offset + PAGE_SIZE
    next_cursor = encode_cursor(next_offset) if next_offset < total else None

    return {
        "items": page_items,
        "posts": page_items,  # Backward compatible alias
        "next_cursor": next_cursor,
        "total": total,
        "tab": tab,
        "is_empty": total == 0,
        "empty_message": _get_empty_state_message(tab)
    }

def _get_empty_state_message(tab: str) -> str:
    if tab.lower() == "following":
        return "You aren't following anyone yet. Explore the For You tab and follow students to see their latest work."
    elif tab.lower() == "teamcalls":
        return "No active team calls match your current filters. Post a call or check back soon."
    return "No projects found matching your filters. Try clearing filters or submit a new project."

@router.get("/rising")
async def get_rising_strip():
    """Returns the top creators whose scores improved this week with score deltas."""
    items = rising_calculator_service.get_rising_strip_items()
    return {
        "total": len(items),
        "creators": items
    }

@router.post("/posts")
async def create_post(payload: Dict[str, Any]):
    """Creates a new Showcase, Upcoming, or Team Call post."""
    author_id = payload.get("user_id", "usr-01")
    author = next((u for u in USERS if u["id"] == author_id), USERS[0])

    new_post = {
        "id": f"post-{len(STORED_POSTS) + 1:02d}",
        "user_id": author["id"],
        "author_name": author["full_name"],
        "author_handle": f"@{author['username']}",
        "post_type": payload.get("post_type", "SHOWCASE").upper(),
        "project_id": payload.get("project_id"),
        "title": payload.get("title", "Untitled Project Post"),
        "body": payload.get("body", ""),
        "score": payload.get("score"),
        "skills": payload.get("skills", []),
        "skills_required": payload.get("skills_required", []),
        "roles_needed": payload.get("roles_needed", []),
        "likes_count": 0,
        "comments_count": 0,
        "posted_at": "Just now",
        "created_at": datetime.now(timezone.utc)
    }

    STORED_POSTS.insert(0, new_post)
    feed_cache_service.invalidate_user_feeds()
    return new_post

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str):
    """Toggles like. Points capped at 10 to prevent social inflation."""
    post = next((p for p in STORED_POSTS if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    post["likes_count"] += 1
    return {
        "post_id": post_id,
        "likes_count": post["likes_count"],
        "points_awarded_capped": min(post["likes_count"], 10)
    }

@router.post("/posts/{post_id}/comment")
async def comment_on_post(post_id: str, payload: Dict[str, str]):
    """Adds a peer feedback comment to a post."""
    post = next((p for p in STORED_POSTS if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    post["comments_count"] = post.get("comments_count", 0) + 1
    return {
        "status": "SUCCESS",
        "comment_id": f"cmt-{datetime.utcnow().timestamp()}",
        "text": payload.get("text", "")
    }

@router.post("/hide")
async def hide_feed_item(payload: Dict[str, str]):
    """Records a 'not interested' hide signal for a creator or skill."""
    user_id = payload.get("user_id", "usr-01")
    target_type = payload.get("target_type", "CREATOR")
    target_value = payload.get("target_value", "")
    feed_cache_service.record_hide(user_id, target_type, target_value)
    return {
        "status": "HIDDEN",
        "target_type": target_type,
        "target_value": target_value
    }

@router.post("/impressions")
async def log_impressions(payload: Dict[str, Any]):
    """Logs impressions for analytics without side-effects."""
    post_ids = payload.get("post_ids", [])
    return {"status": "LOGGED", "count": len(post_ids)}

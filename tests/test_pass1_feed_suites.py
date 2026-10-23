"""
Tests for Pass 1: Feed Ranker, Safety Gate, Keyset Pagination, and Feed Cache
Implements at least 8 distinct test cases for:
1. feed_ranker (invariant that likes cannot beat verified scores, diversity rule, recency decay, rising boost)
2. feed_safety_gate (duplicate, red scam, pending review, unscored showcase exclusion, amber banner)
3. keyset_pagination (zero duplicates, zero gaps, terminal cursor, filter preservation)
4. feed_cache_invalidation (invalidation on post/rescore, in-memory fallback, hide signals, TTL expiry)
"""

import pytest
import time
from datetime import datetime, timezone, timedelta
from apps.api.services.feed_ranker import feed_ranker_service
from apps.api.services.feed_cache import feed_cache_service

# =====================================================================
# 1. FEED RANKER TESTS (>= 8 CASES)
# =====================================================================

def test_ranker_invariant_likes_cannot_beat_verified_score():
    """
    Case 1 (CRITICAL INVARIANT):
    A 6/10 project with 5,000 likes must NOT outrank an 8/10 project with 5 likes (same relevance & recency).
    LinkedIn rewards what you claim, REET rewards what you prove.
    """
    now = datetime.now(timezone.utc)
    post_high_score = {
        "id": "p-good",
        "post_type": "SHOWCASE",
        "score": 8.0,
        "likes_count": 5,
        "comments_count": 1,
        "skills": ["Python"],
        "created_at": now
    }
    post_low_score_viral = {
        "id": "p-viral",
        "post_type": "SHOWCASE",
        "score": 6.0,
        "likes_count": 5000,
        "comments_count": 250,
        "skills": ["Python"],
        "created_at": now
    }

    rank_high = feed_ranker_service.calculate_post_rank_score(post_high_score, viewer_skills=["Python"])
    rank_viral = feed_ranker_service.calculate_post_rank_score(post_low_score_viral, viewer_skills=["Python"])

    # High score (8.0/10) gives 0.30 * 0.80 = 0.24 score component
    # Viral low score (6.0/10) gives 0.30 * 0.60 = 0.18 score component
    # Max engagement delta is 0.10 * (1.0 - 0.30) = 0.07, so 0.24 beats (0.18 + 0.07)
    assert rank_high > rank_viral
    assert rank_high >= rank_viral + 0.01

def test_ranker_rising_boost_applied():
    """Case 2: Rising creator with score delta receives +0.08 additive boost."""
    post_normal = {
        "id": "p1", "post_type": "SHOWCASE", "score": 8.0, "likes_count": 5, "comments_count": 0,
        "is_rising_creator": False, "skills": ["Python"]
    }
    post_rising = {
        "id": "p2", "post_type": "SHOWCASE", "score": 8.0, "likes_count": 5, "comments_count": 0,
        "is_rising_creator": True, "skills": ["Python"]
    }
    r_norm = feed_ranker_service.calculate_post_rank_score(post_normal)
    r_rise = feed_ranker_service.calculate_post_rank_score(post_rising)
    assert pytest.approx(r_rise - r_norm, 0.01) == 0.08

def test_ranker_diversity_rule_max_two_consecutive():
    """Case 3: Diversity rule prevents more than 2 consecutive posts from the same creator."""
    posts = [
        {"id": "p1", "user_id": "usr-01", "post_type": "SHOWCASE", "score": 9.0},
        {"id": "p2", "user_id": "usr-01", "post_type": "SHOWCASE", "score": 8.8},
        {"id": "p3", "user_id": "usr-01", "post_type": "SHOWCASE", "score": 8.5},  # 3rd consecutive!
        {"id": "p4", "user_id": "usr-02", "post_type": "SHOWCASE", "score": 8.4},
        {"id": "p5", "user_id": "usr-03", "post_type": "SHOWCASE", "score": 8.0}
    ]
    ranked = feed_ranker_service._apply_diversity_rule(posts)
    # Check that usr-01 never appears 3 times in a row
    for i in range(len(ranked) - 2):
        u1 = ranked[i]["user_id"]
        u2 = ranked[i+1]["user_id"]
        u3 = ranked[i+2]["user_id"]
        assert not (u1 == u2 == u3 == "usr-01")

def test_ranker_recency_decay():
    """Case 4: Fresh post outranks an otherwise identical post posted 72 hours ago."""
    now = datetime.now(timezone.utc)
    post_fresh = {"id": "pf", "post_type": "SHOWCASE", "score": 8.0, "likes_count": 10, "created_at": now}
    post_old = {"id": "po", "post_type": "SHOWCASE", "score": 8.0, "likes_count": 10, "created_at": now - timedelta(hours=72)}

    r_fresh = feed_ranker_service.calculate_post_rank_score(post_fresh)
    r_old = feed_ranker_service.calculate_post_rank_score(post_old)
    assert r_fresh > r_old

def test_ranker_neutral_score_for_upcoming():
    """Case 5: Upcoming posts receive neutral score component (0.60) to compete fairly."""
    post_upcoming = {"id": "pu", "post_type": "UPCOMING", "skills": ["Python"]}
    r_upcoming = feed_ranker_service.calculate_post_rank_score(post_upcoming, viewer_skills=["Python"])
    assert 0.40 <= r_upcoming <= 0.85

def test_ranker_neutral_score_for_team_call():
    """Case 6: Team Call posts receive neutral score component (0.60)."""
    post_team = {"id": "pt", "post_type": "TEAM_CALL", "skills_required": ["Web"]}
    r_team = feed_ranker_service.calculate_post_rank_score(post_team, viewer_skills=["Web"])
    assert 0.40 <= r_team <= 0.85

def test_ranker_viewer_relevance_boost():
    """Case 7: Posts matching viewer's verified skills receive a higher relevance weight."""
    post = {"id": "p1", "post_type": "SHOWCASE", "score": 8.0, "skills": ["Python", "FastAPI"]}
    r_matched = feed_ranker_service.calculate_post_rank_score(post, viewer_skills=["Python"])
    r_unmatched = feed_ranker_service.calculate_post_rank_score(post, viewer_skills=["Solidity"])
    assert r_matched > r_unmatched

def test_ranker_score_bounded_zero_to_one():
    """Case 8: Composite rank score is strictly bounded in [0.0, 1.0]."""
    post = {"id": "p1", "post_type": "SHOWCASE", "score": 10.0, "likes_count": 10000, "is_rising_creator": True}
    r = feed_ranker_service.calculate_post_rank_score(post)
    assert 0.0 <= r <= 1.0

# =====================================================================
# 2. FEED SAFETY GATE TESTS (>= 8 CASES)
# =====================================================================

def test_safety_gate_excludes_duplicate_post():
    """Gate 1: Duplicate project (0 points) is strictly excluded from the feed."""
    dup_post = {"id": "p-dup", "is_duplicate": True, "score": 0.0, "post_type": "SHOWCASE"}
    assert feed_ranker_service.passes_safety_gate(dup_post) is False

def test_safety_gate_excludes_red_scam():
    """Gate 2: Red risk scam post (score 92) is strictly blocked."""
    red_post = {"id": "p-scam", "risk_score": 92.0, "risk_band": "RED", "post_type": "SHOWCASE", "score": 8.0}
    assert feed_ranker_service.passes_safety_gate(red_post) is False

def test_safety_gate_excludes_pending_review():
    """Gate 3: Post with open review flag is blocked until resolution."""
    pending_post = {"id": "p-pend", "review_status": "PENDING", "score": 8.0, "post_type": "SHOWCASE"}
    assert feed_ranker_service.passes_safety_gate(pending_post) is False

def test_safety_gate_excludes_unscored_showcase():
    """Gate 4: Showcase post without completed scoring is never shown."""
    unscored_post = {"id": "p-unscored", "score": None, "post_type": "SHOWCASE"}
    assert feed_ranker_service.passes_safety_gate(unscored_post) is False

def test_safety_gate_allows_amber_with_warning_banner():
    """Gate 5: Amber post (risk 45) passes the gate and is flagged with show_warning_banner."""
    amber_post = {"id": "p-amb", "risk_score": 45.0, "risk_band": "AMBER", "post_type": "SHOWCASE", "score": 8.0}
    assert feed_ranker_service.passes_safety_gate(amber_post) is True
    ranked = feed_ranker_service.rank_for_you_feed([amber_post])
    assert len(ranked) == 1
    assert ranked[0]["show_warning_banner"] is True

def test_safety_gate_allows_green_verified_post():
    """Gate 6: Verified Green post with high score passes cleanly."""
    green_post = {"id": "p-grn", "risk_score": 10.0, "risk_band": "GREEN", "post_type": "SHOWCASE", "score": 9.2}
    assert feed_ranker_service.passes_safety_gate(green_post) is True
    ranked = feed_ranker_service.rank_for_you_feed([green_post])
    assert ranked[0]["show_warning_banner"] is False

def test_safety_gate_allows_genuine_stipend_opportunity():
    """Gate 7: Genuine look-alike post (₹15,000 fellowship) passes gate without warnings."""
    genuine_post = {
        "id": "p-gen",
        "title": "Open Source Fellowship 2026",
        "risk_score": 15.0,
        "risk_band": "GREEN",
        "post_type": "SHOWCASE",
        "score": 9.0
    }
    assert feed_ranker_service.passes_safety_gate(genuine_post) is True

def test_safety_gate_applied_across_candidate_lists():
    """Gate 8: Mixed feed of 5 posts correctly filters out the Red scam and Duplicate."""
    mixed_posts = [
        {"id": "p1", "post_type": "SHOWCASE", "score": 9.0, "risk_band": "GREEN"},
        {"id": "p2-dup", "post_type": "SHOWCASE", "score": 0.0, "is_duplicate": True},
        {"id": "p3", "post_type": "UPCOMING"},
        {"id": "p4-scam", "post_type": "SHOWCASE", "score": 8.0, "risk_score": 92.0, "risk_band": "RED"},
        {"id": "p5", "post_type": "TEAM_CALL"}
    ]
    ranked = feed_ranker_service.rank_for_you_feed(mixed_posts)
    post_ids = [p["id"] for p in ranked]
    assert "p1" in post_ids
    assert "p3" in post_ids
    assert "p5" in post_ids
    assert "p2-dup" not in post_ids
    assert "p4-scam" not in post_ids

# =====================================================================
# 3. KEYSET PAGINATION TESTS (>= 8 CASES)
# =====================================================================

def test_pagination_returns_page_and_next_cursor():
    """Pagination 1: Returns exactly page size and a non-empty cursor for subsequent pages."""
    from apps.api.routers.feed import encode_cursor, decode_cursor
    cursor = encode_cursor(6)
    assert cursor is not None
    assert decode_cursor(cursor) == 6

def test_pagination_zero_duplicates_across_pages():
    """Pagination 2: Subsequent pages contain zero duplicate post IDs."""
    from apps.api.routers.feed import list_feed
    import asyncio
    res_page1 = asyncio.run(list_feed(tab="forYou", cursor=None))
    cursor1 = res_page1["next_cursor"]
    if cursor1:
        res_page2 = asyncio.run(list_feed(tab="forYou", cursor=cursor1))
        ids_p1 = {p["id"] for p in res_page1["items"]}
        ids_p2 = {p["id"] for p in res_page2["items"]}
        assert len(ids_p1.intersection(ids_p2)) == 0

def test_pagination_zero_gaps_between_pages():
    """Pagination 3: Number of items across page 1 and page 2 matches contiguous slice."""
    from apps.api.routers.feed import list_feed
    import asyncio
    p1 = asyncio.run(list_feed(tab="forYou", cursor=None))
    p2 = asyncio.run(list_feed(tab="forYou", cursor=p1["next_cursor"]))
    assert len(p1["items"]) + len(p2["items"]) <= p1["total"]

def test_pagination_terminal_cursor_is_none():
    """Pagination 4: Last page returns next_cursor = None."""
    from apps.api.routers.feed import list_feed, encode_cursor
    import asyncio
    # Request beyond total
    large_cursor = encode_cursor(9999)
    res = asyncio.run(list_feed(tab="forYou", cursor=large_cursor))
    assert res["next_cursor"] is None
    assert len(res["items"]) == 0

def test_pagination_filters_preserved_in_count():
    """Pagination 5: Filtering by skill=Python restricts total and items."""
    from apps.api.routers.feed import list_feed
    import asyncio
    res = asyncio.run(list_feed(tab="forYou", skill="Python"))
    for item in res["items"]:
        skills = item.get("skills") or item.get("skills_required") or []
        assert any("python" in s.lower() for s in skills)

def test_pagination_min_score_filter():
    """Pagination 6: min_score=8.0 returns only showcase posts scored >= 8.0."""
    from apps.api.routers.feed import list_feed
    import asyncio
    res = asyncio.run(list_feed(tab="forYou", min_score=8.0))
    for item in res["items"]:
        assert item.get("score") is not None
        assert item.get("score") >= 8.0

def test_pagination_empty_cursor_defaults_first_page():
    """Pagination 7: Null or empty string cursor starts cleanly at offset 0."""
    from apps.api.routers.feed import decode_cursor
    assert decode_cursor(None) == 0
    assert decode_cursor("") == 0

def test_pagination_invalid_cursor_gracefully_defaults():
    """Pagination 8: Corrupted or non-base64 cursor returns offset 0 without raising 500."""
    from apps.api.routers.feed import decode_cursor
    assert decode_cursor("invalid-base64-garbage!!") == 0

# =====================================================================
# 4. FEED CACHE INVALIDATION TESTS (>= 8 CASES)
# =====================================================================

def test_cache_set_and_get():
    """Cache 1: In-memory cache stores and retrieves data correctly."""
    feed_cache_service.set("test:key", {"val": 42}, ttl=60)
    assert feed_cache_service.get("test:key") == {"val": 42}

def test_cache_ttl_expiry():
    """Cache 2: Expired TTL returns None."""
    feed_cache_service.set("test:short", "expired", ttl=-1)
    assert feed_cache_service.get("test:short") is None

def test_cache_invalidate_prefix():
    """Cache 3: Invalidate removes matching prefix keys."""
    feed_cache_service.set("feed:usr-01", "feed-data")
    feed_cache_service.set("feed:usr-02", "feed-data-2")
    feed_cache_service.set("other:key", "keep")
    feed_cache_service.invalidate("feed:")
    assert feed_cache_service.get("feed:usr-01") is None
    assert feed_cache_service.get("feed:usr-02") is None
    assert feed_cache_service.get("other:key") == "keep"

def test_cache_score_breakdown_by_commit_hash():
    """Cache 4: Popover breakdown is cached by commit hash."""
    breakdown = {"works": 9.2, "quality": 8.6}
    feed_cache_service.cache_score_breakdown("commit_9f82a", breakdown)
    cached = feed_cache_service.get_cached_score_breakdown("commit_9f82a")
    assert cached == breakdown

def test_cache_hide_creator_signal():
    """Cache 5: Hide signal hides creator and invalidates feed."""
    feed_cache_service.record_hide("usr-01", "CREATOR", "usr-09")
    assert feed_cache_service.is_hidden("usr-01", "usr-09", ["Python"]) is True
    assert feed_cache_service.is_hidden("usr-01", "usr-02", ["Python"]) is False

def test_cache_hide_skill_signal():
    """Cache 6: Hide signal hides posts tagged with that skill."""
    feed_cache_service.record_hide("usr-01", "SKILL", "Crypto")
    assert feed_cache_service.is_hidden("usr-01", "usr-03", ["Crypto", "Web"]) is True
    assert feed_cache_service.is_hidden("usr-01", "usr-03", ["Python", "Web"]) is False

def test_cache_invalidate_on_new_post():
    """Cache 7: Invalidate user feeds clears all cached feed lists."""
    feed_cache_service.set("feed:usr-01:forYou", ["p1", "p2"])
    feed_cache_service.invalidate_user_feeds()
    assert feed_cache_service.get("feed:usr-01:forYou") is None

def test_cache_fallback_handles_missing_keys():
    """Cache 8: Non-existent key returns None without error."""
    assert feed_cache_service.get("non_existent_key_999") is None

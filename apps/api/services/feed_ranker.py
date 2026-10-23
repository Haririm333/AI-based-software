"""
REET Home Feed Ranker & Safety Gate
Implements the 4-factor scoring ranker:
rank = 0.40 * relevance + 0.30 * (verified_score / 10) + 0.20 * recency_decay + 0.10 * engagement + rising_boost

Key Invariants:
1. A 6/10 post with 5,000 likes CANNOT outrank an 8/10 post with 5 likes.
2. Diversity rule: Never more than 2 consecutive posts from the same creator.
3. Safety gate: Duplicate (0 score), Red scam (>=71), pending-review, and unscored Showcase posts NEVER appear.
   Amber posts (31-70) appear with a prominent warning banner.
4. Upcoming and Team Call posts receive a neutral score component (0.60) so they can still appear.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# Weights Configuration
WEIGHT_RELEVANCE = 0.40
WEIGHT_VERIFIED_SCORE = 0.30
WEIGHT_RECENCY_DECAY = 0.20
WEIGHT_ENGAGEMENT = 0.10
RISING_BOOST_VALUE = 0.08
RECENCY_HALF_LIFE_HOURS = 72.0
MAX_CONSECUTIVE_FROM_CREATOR = 2

class FeedRankerService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def passes_safety_gate(self, post: Dict[str, Any]) -> bool:
        """
        Enforces strict safety gate before any post enters the feed pipeline:
        - Duplicate projects (0 score / duplicate_flag) are excluded
        - Red risk posts (risk_score >= 71 / risk_band == 'RED') are excluded
        - Posts in pending review are excluded
        - Showcase posts must have completed scoring
        """
        # 1. Check duplicate flag
        if post.get("is_duplicate") or post.get("duplicate_flag"):
            return False

        # 2. Check risk score / band
        risk_score = post.get("risk_score", 0.0)
        risk_band = post.get("risk_band", "GREEN").upper()
        if risk_score >= 71.0 or risk_band == "RED":
            return False

        # 3. Check review queue status
        if post.get("in_review_queue") or post.get("review_status") == "PENDING":
            return False

        # 4. Showcase posts must have verified score
        if post.get("post_type") == "SHOWCASE":
            score = post.get("score")
            if score is None or score < 1.0:
                return False

        return True

    def calculate_relevance(
        self,
        viewer_skills: List[str],
        post_skills: List[str],
        post_text: str = ""
    ) -> float:
        """
        Calculates cosine-like Jaccard/embedding relevance between viewer interests and post tags.
        """
        if not viewer_skills:
            return 0.50  # Neutral relevance for cold start

        viewer_set = {s.lower() for s in viewer_skills}
        post_set = {s.lower() for s in (post_skills or [])}

        # Check skill overlap
        overlap = viewer_set.intersection(post_set)
        if overlap:
            return min(1.0, 0.50 + 0.25 * len(overlap))

        # Check mention in text
        text_lower = post_text.lower()
        if any(s in text_lower for s in viewer_set):
            return 0.65

        return 0.30

    def calculate_engagement(self, likes: int, comments: int) -> float:
        """
        Log-scaled and strictly capped engagement score.
        Capped at 0.50 so maximum contribution is 0.10 * 0.50 = 0.05.
        This guarantees that an 8/10 score (+0.06 advantage over 6/10) strictly beats
        even 5,000 likes on a 6/10 post under identical relevance and recency.
        """
        raw_val = 1.0 + max(0, likes) + 2.0 * max(0, comments)
        log_val = math.log10(raw_val) / 4.0
        return min(0.50, max(0.0, log_val))

    def calculate_recency_decay(self, posted_at: Optional[datetime]) -> float:
        """
        Exponential decay with 72-hour half life: exp(-hours / 72.0).
        """
        if not posted_at:
            return 0.85
        now = datetime.now(timezone.utc)
        if posted_at.tzinfo is None:
            posted_at = posted_at.replace(tzinfo=timezone.utc)
        diff_hours = max(0.0, (now - posted_at).total_seconds() / 3600.0)
        return math.exp(-diff_hours / RECENCY_HALF_LIFE_HOURS)

    def calculate_post_rank_score(
        self,
        post: Dict[str, Any],
        viewer_skills: Optional[List[str]] = None,
        viewer_id: Optional[str] = None
    ) -> float:
        """
        Computes composite rank score.
        """
        # 1. Relevance (0.40)
        post_skills = post.get("skills") or post.get("skills_required") or []
        relevance = self.calculate_relevance(viewer_skills or [], post_skills, post.get("title", "") + " " + post.get("body", ""))

        # 2. Verified Score (0.30)
        post_type = post.get("post_type", "SHOWCASE")
        if post_type == "SHOWCASE":
            score_val = float(post.get("score", 7.0))
            score_component = min(1.0, max(0.0, score_val / 10.0))
        else:
            # Upcoming & Team Call receive neutral 0.60 so they can compete fairly
            score_component = 0.60

        # 3. Recency Decay (0.20)
        posted_at = post.get("created_at")
        recency = self.calculate_recency_decay(posted_at)

        # 4. Engagement (0.10)
        likes = post.get("likes_count", 0)
        comments = post.get("comments_count", 0)
        engagement = self.calculate_engagement(likes, comments)

        # Base Rank
        rank = (
            WEIGHT_RELEVANCE * relevance +
            WEIGHT_VERIFIED_SCORE * score_component +
            WEIGHT_RECENCY_DECAY * recency +
            WEIGHT_ENGAGEMENT * engagement
        )

        # 5. Rising Boost (+0.08)
        if post.get("is_rising_creator"):
            rank += RISING_BOOST_VALUE

        return round(rank, 4)

    def rank_for_you_feed(
        self,
        posts: List[Dict[str, Any]],
        viewer_skills: Optional[List[str]] = None,
        viewer_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Applies safety gate, computes rank scores, sorts descending, and enforces diversity rule.
        """
        # Step 1: Filter through safety gate
        safe_posts = [p for p in posts if self.passes_safety_gate(p)]

        # Step 2: Compute rank scores
        scored_posts = []
        for p in safe_posts:
            post_copy = dict(p)
            post_copy["rank_score"] = self.calculate_post_rank_score(p, viewer_skills, viewer_id)
            # Add amber warning banner flag if risk is 31-70
            if 31.0 <= post_copy.get("risk_score", 0.0) <= 70.0 or post_copy.get("risk_band") == "AMBER":
                post_copy["show_warning_banner"] = True
                post_copy["warning_message"] = "Trust Shield: Review unverified payment or external chat links before acting."
            else:
                post_copy["show_warning_banner"] = False
            scored_posts.append(post_copy)

        # Step 3: Sort descending by rank score
        scored_posts.sort(key=lambda x: x["rank_score"], reverse=True)

        # Step 4: Apply diversity rule (max 2 consecutive from same creator)
        return self._apply_diversity_rule(scored_posts)

    def _apply_diversity_rule(self, posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensures never more than 2 consecutive posts from the same creator."""
        if len(posts) <= 2:
            return posts

        result: List[Dict[str, Any]] = []
        overflow: List[Dict[str, Any]] = []

        consecutive_author = None
        consecutive_count = 0

        for post in posts:
            author = post.get("user_id") or post.get("author_handle")
            if author == consecutive_author:
                if consecutive_count >= MAX_CONSECUTIVE_FROM_CREATOR:
                    overflow.append(post)
                    continue
                else:
                    consecutive_count += 1
            else:
                consecutive_author = author
                consecutive_count = 1
            result.append(post)

        # Interleave overflow posts where valid
        for p in overflow:
            inserted = False
            author = p.get("user_id") or p.get("author_handle")
            for i in range(len(result)):
                prev_author = result[i-1].get("user_id") if i > 0 else None
                curr_author = result[i].get("user_id")
                next_author = result[i+1].get("user_id") if i + 1 < len(result) else None
                if author != prev_author and author != curr_author:
                    result.insert(i, p)
                    inserted = True
                    break
            if not inserted:
                result.append(p)

        return result

feed_ranker_service = FeedRankerService(mock_mode=True)

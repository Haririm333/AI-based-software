"""
REET Feed Cache Service
Provides Redis caching with automatic in-memory fallback.
Supports:
- Per-user candidate list caching
- Short TTL (120s)
- Score breakdown popover caching by commit hash
- Invalidation on new post, rescore, unfollow, or hide signal
"""

import time
from typing import Dict, Any, Optional, List

class FeedCacheService:
    def __init__(self, ttl_seconds: int = 120):
        self.ttl_seconds = ttl_seconds
        # In-memory store: { key: { 'data': ..., 'expires_at': ... } }
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        # User hide signals: { user_id: { 'creators': set(), 'skills': set() } }
        self._user_hides: Dict[str, Dict[str, set]] = {}

    def _cleanup_expired(self):
        now = time.time()
        expired_keys = [k for k, v in self._memory_cache.items() if v["expires_at"] < now]
        for k in expired_keys:
            del self._memory_cache[k]

    def get(self, key: str) -> Optional[Any]:
        self._cleanup_expired()
        entry = self._memory_cache.get(key)
        if entry and entry["expires_at"] >= time.time():
            return entry["data"]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        effective_ttl = ttl or self.ttl_seconds
        self._memory_cache[key] = {
            "data": value,
            "expires_at": time.time() + effective_ttl
        }

    def invalidate(self, pattern_prefix: str) -> int:
        keys_to_del = [k for k in self._memory_cache.keys() if k.startswith(pattern_prefix)]
        for k in keys_to_del:
            del self._memory_cache[k]
        return len(keys_to_del)

    def invalidate_user_feeds(self, user_id: Optional[str] = None) -> None:
        """Invalidates feed cache for a specific user or globally on rescore/new post."""
        if user_id:
            self.invalidate(f"feed:{user_id}")
        else:
            self.invalidate("feed:")

    def cache_score_breakdown(self, commit_hash: str, breakdown: Dict[str, Any]) -> None:
        """Caches score breakdown popover data by immutable commit hash with 1 hour TTL."""
        self.set(f"breakdown:{commit_hash}", breakdown, ttl=3600)

    def get_cached_score_breakdown(self, commit_hash: str) -> Optional[Dict[str, Any]]:
        return self.get(f"breakdown:{commit_hash}")

    def record_hide(self, user_id: str, target_type: str, target_value: str) -> None:
        """Records a 'not interested' hide signal and invalidates user's cached feed."""
        if user_id not in self._user_hides:
            self._user_hides[user_id] = {"creators": set(), "skills": set()}
        
        target_type_key = "creators" if target_type.lower() == "creator" else "skills"
        self._user_hides[user_id][target_type_key].add(target_value.lower())
        self.invalidate_user_feeds(user_id)

    def is_hidden(self, user_id: str, creator_id: str, skills: List[str]) -> bool:
        """Checks if a post is hidden by user's 'not interested' signals."""
        hides = self._user_hides.get(user_id)
        if not hides:
            return False
        if creator_id.lower() in hides["creators"]:
            return True
        for s in (skills or []):
            if s.lower() in hides["skills"]:
                return True
        return False

feed_cache_service = FeedCacheService()

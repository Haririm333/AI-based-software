"""
REET Level & Skill Points Calculator
Implements the anti-inflation skill progression system:
- Points are earned per skill per verified project.
- Level strictly uses the TOP 5 projects in that skill (plus log-diminished tail for >5),
  preventing 50 trivial one-file scripts from beating 5 rigorous projects.
- Bonus points for collaboration confirmations (+30) and mentor endorsements (+40).
- Social likes are strictly capped at 10 points max.
- Mathematical level formula: Level = floor(sqrt(EffectivePoints / 100)) + 1
"""

import math
from typing import List, Dict, Any
from packages.shared.constants import MAX_TOP_PROJECTS, MAX_LIKES_POINT_CAP, COLLAB_BONUS, MENTOR_BONUS

class LevelCalculator:
    def calculate_project_skill_points(self, score: float, difficulty_multiplier: float = 1.0) -> int:
        """
        Calculates verified skill points for an individual project.
        Points = round(Score * DifficultyMultiplier * 25)
        """
        mult = max(1.0, min(2.0, difficulty_multiplier))
        return int(round(score * mult * 25))

    def calculate_effective_skill_level(
        self,
        project_scores: List[float],
        collab_count: int = 0,
        mentor_endorsements: int = 0,
        likes_count: int = 0
    ) -> Dict[str, Any]:
        """
        Calculates verified level with strict anti-inflation guarantees.
        """
        # Sort scores descending to isolate Top 5 projects
        sorted_scores = sorted(project_scores, reverse=True)
        top_5 = sorted_scores[:MAX_TOP_PROJECTS]
        tail = sorted_scores[MAX_TOP_PROJECTS:]

        # 1. Top 5 Projects Points
        top_5_points = sum(self.calculate_project_skill_points(s) for s in top_5)

        # 2. Diminished Logarithmic Bonus for projects beyond Top 5 (anti-spam)
        # Prevents 50 trivial projects from inflating level
        tail_bonus = 0
        if tail:
            tail_bonus = int(math.floor(5 * math.log(1 + len(tail))))

        # 3. Add Verified Collaboration & Mentor Endorsements
        collab_points = collab_count * COLLAB_BONUS
        mentor_points = mentor_endorsements * MENTOR_BONUS

        # 4. Likes Capped at 10 points
        capped_likes = min(likes_count, MAX_LIKES_POINT_CAP)

        total_effective_points = top_5_points + tail_bonus + collab_points + mentor_points + capped_likes

        # 5. Formula: Level = floor(sqrt(EffectivePoints / 100)) + 1
        level = int(math.floor(math.sqrt(total_effective_points / 100.0))) + 1

        # Current level progress to next tier
        current_tier_min = ((level - 1) ** 2) * 100
        next_tier_min = (level ** 2) * 100
        progress_pct = min(100.0, round(((total_effective_points - current_tier_min) / max(1, next_tier_min - current_tier_min)) * 100, 1))

        return {
            "level": level,
            "total_effective_points": total_effective_points,
            "top_5_points": top_5_points,
            "tail_bonus": tail_bonus,
            "collab_points": collab_points,
            "mentor_points": mentor_points,
            "likes_points": capped_likes,
            "progress_to_next_level_pct": progress_pct,
            "projects_counted_top5": len(top_5),
            "excess_projects_diminished": len(tail)
        }

level_calculator = LevelCalculator()

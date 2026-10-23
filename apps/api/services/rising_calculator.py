"""
REET Rising Projects Calculator
Calculates creators whose scores improved this week for the Rising strip.
Shows before/after score and score delta.
"""

from typing import List, Dict, Any

RISING_CREATORS_SEED = [
    {
        "user_id": "usr-06",
        "creator_name": "Sneha Sundaram",
        "creator_handle": "@sneha_tech",
        "avatar_url": "👩‍💻",
        "college": "TCE, Tamil Nadu",
        "project_title": "Edge Indic Speech Synthesizer",
        "score_before": 6.4,
        "score_after": 8.8,
        "score_delta": 2.4,
        "primary_skill": "Python",
        "improved_at": "Yesterday"
    },
    {
        "user_id": "usr-04",
        "creator_name": "Kavya Menon",
        "creator_handle": "@kavya_m",
        "avatar_url": "👩‍💻",
        "college": "CUSAT, Kerala",
        "project_title": "Wayanad Coffee Logistics Tracker",
        "score_before": 5.8,
        "score_after": 8.2,
        "score_delta": 2.4,
        "primary_skill": "Web",
        "improved_at": "2 days ago"
    },
    {
        "user_id": "usr-03",
        "creator_name": "Rohan Deshmukh",
        "creator_handle": "@rohan_d",
        "avatar_url": "👨‍💻",
        "college": "COEP, Maharashtra",
        "project_title": "Solar Powered Cold Storage Telemetry",
        "score_before": 7.0,
        "score_after": 9.1,
        "score_delta": 2.1,
        "primary_skill": "Python",
        "improved_at": "3 days ago"
    }
]

class RisingCalculatorService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def get_rising_strip_items(self) -> List[Dict[str, Any]]:
        """Returns ordered list of rising creators with score deltas."""
        return sorted(RISING_CREATORS_SEED, key=lambda x: x["score_delta"], reverse=True)

rising_calculator_service = RisingCalculatorService(mock_mode=True)

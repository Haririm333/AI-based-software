"""
REET Chat & Bhasha Bridge Router
Realtime group and 1-to-1 messaging with:
- Bhasha Bridge translation (Tamil, Hindi, Telugu, Malayalam, English)
- Payment Guard interception on send and receive
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from datetime import datetime

from apps.api.services.translator import translator_service
from apps.api.services.payment_guard import payment_guard_service
from apps.api.routers.team_up import COLLAB_GROUPS
from packages.shared.seed_data import USERS

router = APIRouter(prefix="/api/v1/chat", tags=["Chat & Bhasha Bridge"])

@router.get("/groups")
async def get_user_chat_groups():
    """Lists collaborative team chat channels."""
    return {"groups": COLLAB_GROUPS}

@router.get("/groups/{group_id}/messages")
async def get_group_messages(
    group_id: str,
    target_lang: str = Query("en", description="Translate messages into reader's preferred language")
):
    """Retrieves chat messages translated into the recipient's native language."""
    group = next((g for g in COLLAB_GROUPS if g["id"] == group_id), None)
    if not group:
        raise HTTPException(status_code=404, detail="Chat group not found.")

    processed_messages = []
    for msg in group.get("messages", []):
        trans = translator_service.translate(msg["text"], target_lang=target_lang)
        processed_messages.append({
            "sender_id": msg["sender_id"],
            "sender_name": msg.get("sender_name", "Student"),
            "original_text": msg["text"],
            "translated_text": trans["translated_text"],
            "is_machine_translated": trans["is_machine_translated"],
            "target_language": target_lang,
            "time": msg.get("time", "Now")
        })

    return {
        "group_id": group_id,
        "group_name": group["name"],
        "reader_language": target_lang,
        "messages": processed_messages
    }

@router.post("/send")
async def send_chat_message(payload: Dict[str, Any]):
    """Sends a chat message and runs real-time Payment Guard interceptor."""
    group_id = payload.get("group_id", "grp-01")
    sender_id = payload.get("sender_id", "usr-01")
    text = payload.get("text", "")

    sender = next((u for u in USERS if u["id"] == sender_id), USERS[0])
    group = next((g for g in COLLAB_GROUPS if g["id"] == group_id), None)
    if not group:
        raise HTTPException(status_code=404, detail="Chat group not found.")

    # 1. Inspect with Payment Guard
    guard_result = payment_guard_service.inspect_message(text)

    # 2. Append message
    new_msg = {
        "sender_id": sender_id,
        "sender_name": sender["full_name"],
        "text": text,
        "time": datetime.now().strftime("%I:%M %p"),
        "payment_intercept_flag": guard_result["is_payment_moment"],
        "intercepted_upi": guard_result["detected_upis"][0] if guard_result["detected_upis"] else None
    }
    group["messages"].append(new_msg)

    return {
        "status": "SENT",
        "message": new_msg,
        "payment_guard": guard_result
    }

@router.post("/inspect-payment")
async def inspect_payment_moment(payload: Dict[str, str]):
    """Inspects text for payment requests and returns blocking modal configuration."""
    text = payload.get("message", "")
    return payment_guard_service.inspect_message(text)

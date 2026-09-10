from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import AssistantQueryRequest, AssistantQueryResponse
from app.ai.safety_assistant import safety_assistant

router = APIRouter()

@router.post("/chat", response_model=AssistantQueryResponse)
def assistant_chat(payload: AssistantQueryRequest, db: Session = Depends(get_db)):
    result = safety_assistant.answer_query(payload.query, db)
    return result

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import PrecursorPattern
from app.ai.precursor_miner import precursor_miner
from app.schemas.schemas import PrecursorPatternResponse

router = APIRouter()

@router.get("", response_model=List[PrecursorPatternResponse])
def list_patterns(
    emerging_only: bool = Query(False),
    risk_level: Optional[str] = None,
    activity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PrecursorPattern)
    
    if emerging_only:
        query = query.filter(PrecursorPattern.trend == "Increasing")
    if risk_level and risk_level != "ALL":
        query = query.filter(PrecursorPattern.risk_level == risk_level)
    if activity and activity != "ALL":
        query = query.filter(PrecursorPattern.activity.ilike(f"%{activity}%"))

    patterns = query.order_by(desc(PrecursorPattern.sif_association_rate), desc(PrecursorPattern.occurrence_count)).all()
    
    # If patterns table is empty, auto-mine
    if not patterns:
        precursor_miner.mine_patterns_from_db(db)
        patterns = db.query(PrecursorPattern).order_by(desc(PrecursorPattern.sif_association_rate)).all()
        
    return patterns

@router.post("/refresh")
def refresh_patterns(db: Session = Depends(get_db)):
    results = precursor_miner.mine_patterns_from_db(db)
    return {
        "status": "success",
        "patterns_mined": len(results),
        "patterns": results[:10]
    }

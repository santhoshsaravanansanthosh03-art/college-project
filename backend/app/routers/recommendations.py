from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.recommendations import recommendation_engine

router = APIRouter(prefix="/recommendations", tags=["Rewards & AI Recommendations"])

@router.get("", response_model=List[Dict[str, Any]])
def get_recommendations():
    return recommendation_engine.get_recommendations()

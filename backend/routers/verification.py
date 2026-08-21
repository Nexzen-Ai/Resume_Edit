from fastapi import APIRouter, HTTPException, status
from models.schemas import VerificationPublicResponse
from services.verification_service import get_public_verification

router = APIRouter(prefix="/verification", tags=["verification"])


@router.get("/verify/{token_id}", response_model=VerificationPublicResponse)
def verify_token(token_id: str):
    try:
        data = get_public_verification(token_id)
        return data
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

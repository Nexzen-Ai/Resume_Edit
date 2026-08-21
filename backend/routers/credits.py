from fastapi import APIRouter, Depends, HTTPException, status
from routers.auth import current_user
from services.credit_service import (
    get_user_credits,
    verify_and_grant_edu_bonus,
    redeem_referral_code
)
from models.schemas import (
    CreditBalanceResponse,
    EduVerificationResponse,
    RedeemReferralRequest,
    RedeemReferralResponse
)

router = APIRouter(prefix="/credits", tags=["credits"])


@router.get("/balance", response_model=CreditBalanceResponse)
def get_balance(user: dict = Depends(current_user)):
    user_id = user["id"]
    try:
        data = get_user_credits(user_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/verify-edu", response_model=EduVerificationResponse)
def verify_edu(user: dict = Depends(current_user)):
    user_id = user["id"]
    email = user.get("email", "")
    try:
        res = verify_and_grant_edu_bonus(user_id, email)
        return res
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/redeem-referral", response_model=RedeemReferralResponse)
def redeem_referral(req: RedeemReferralRequest, user: dict = Depends(current_user)):
    user_id = user["id"]
    try:
        res = redeem_referral_code(user_id, req.referral_code)
        return res
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

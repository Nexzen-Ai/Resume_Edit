import uuid
from datetime import datetime
from database import supabase


def get_user_credits(user_id: str) -> dict:
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            return {
                "credits_balance": 5,
                "is_edu_verified": False,
                "referral_code": f"NEX-{uuid.uuid4().hex[:8].upper()}",
                "history": []
            }
        
        user_data = user_res.data[0]
        ref_code = user_data.get("referral_code")
        if not ref_code:
            ref_code = f"NEX-{uuid.uuid4().hex[:8].upper()}"
            try:
                supabase.table("users").update({"referral_code": ref_code}).eq("id", user_id).execute()
            except Exception:
                pass
            user_data["referral_code"] = ref_code
            
        history = []
        try:
            ledger_res = supabase.table("credits_ledger").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
            history = ledger_res.data or []
        except Exception:
            history = []
        
        return {
            "credits_balance": user_data.get("credits_balance") if user_data.get("credits_balance") is not None else 5,
            "is_edu_verified": bool(user_data.get("is_edu_verified", False)),
            "referral_code": ref_code,
            "history": history
        }
    except Exception as e:
        print(f"[Credits] get_user_credits fallback: {e}")
        return {
            "credits_balance": 5,
            "is_edu_verified": False,
            "referral_code": f"NEX-{uuid.uuid4().hex[:8].upper()}",
            "history": []
        }


def check_and_deduct_credits(user_id: str, cost: int, transaction_type: str, description: str) -> bool:
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            return True  # fallback permit if user lookup fails
        
        current_balance = user_res.data[0].get("credits_balance")
        if current_balance is None:
            current_balance = 5  # default credits
            
        if current_balance < cost:
            return False
        
        new_balance = current_balance - cost
        try:
            supabase.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
        except Exception:
            pass
        
        # Record in ledger
        try:
            supabase.table("credits_ledger").insert({
                "user_id": user_id,
                "amount": -cost,
                "transaction_type": transaction_type,
                "description": description
            }).execute()
        except Exception:
            pass
        
        return True
    except Exception as e:
        print(f"[Credits] check_and_deduct_credits error: {e}")
        return True


def grant_credits(user_id: str, amount: int, transaction_type: str, description: str) -> int:
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        current_balance = 5
        if user_res.data:
            current_balance = user_res.data[0].get("credits_balance") or 5
        
        new_balance = current_balance + amount
        
        try:
            supabase.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
        except Exception:
            pass
        
        try:
            supabase.table("credits_ledger").insert({
                "user_id": user_id,
                "amount": amount,
                "transaction_type": transaction_type,
                "description": description
            }).execute()
        except Exception:
            pass
        
        return new_balance
    except Exception:
        return 10


def verify_and_grant_edu_bonus(user_id: str, email: str) -> dict:
    try:
        user_res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not user_res.data:
            return {"success": False, "message": "User not found", "bonus_granted": 0, "new_balance": 5}
        
        user_data = user_res.data[0]
        if user_data.get("is_edu_verified"):
            return {
                "success": False,
                "message": "User email is already verified for student bonus.",
                "bonus_granted": 0,
                "new_balance": user_data.get("credits_balance", 5)
            }
            
        domain = email.split("@")[-1].lower() if "@" in email else ""
        is_edu = domain.endswith(".edu") or "ac.in" in domain or "edu." in domain or "university" in domain or "college" in domain
        
        if not is_edu:
            return {
                "success": False,
                "message": f"Email domain '@{domain}' is not recognized as an educational domain (.edu / .ac.in / university domain).",
                "bonus_granted": 0,
                "new_balance": user_data.get("credits_balance", 5)
            }
            
        # Mark verified and grant 10 bonus credits
        try:
            supabase.table("users").update({"is_edu_verified": True}).eq("id", user_id).execute()
        except Exception:
            pass
            
        new_bal = grant_credits(user_id, 10, "edu_bonus", f"Student verification bonus for @{domain}")
        
        return {
            "success": True,
            "message": "Educational email verified! 10 bonus credits added to your account.",
            "bonus_granted": 10,
            "new_balance": new_bal
        }
    except Exception as e:
        return {"success": False, "message": str(e), "bonus_granted": 0, "new_balance": 5}


def redeem_referral_code(referee_id: str, referral_code: str) -> dict:
    try:
        ref_code_clean = referral_code.strip()
        referrer_res = supabase.table("users").select("*").eq("referral_code", ref_code_clean).execute()
        
        if not referrer_res.data:
            return {
                "success": False,
                "message": "Invalid referral code.",
                "credits_granted": 0,
                "new_balance": 0
            }
            
        referrer = referrer_res.data[0]
        referrer_id = referrer["id"]
        
        if referrer_id == referee_id:
            return {
                "success": False,
                "message": "You cannot redeem your own referral code.",
                "credits_granted": 0,
                "new_balance": 0
            }
            
        # Check if already redeemed
        try:
            existing_ref = supabase.table("referrals").select("id").eq("referee_id", referee_id).execute()
            if existing_ref.data:
                return {
                    "success": False,
                    "message": "You have already redeemed a referral code.",
                    "credits_granted": 0,
                    "new_balance": 0
                }
        except Exception:
            pass
            
        # Grant +5 to referee and +5 to referrer
        grant_credits(referrer_id, 5, "referral_earned", f"Reciprocal referral bonus for referring a classmate.")
        referee_new_bal = grant_credits(referee_id, 5, "referral_earned", f"Reciprocal referral signup bonus.")
        
        # Record referral link
        try:
            supabase.table("referrals").insert({
                "referrer_id": referrer_id,
                "referee_id": referee_id,
                "referral_code": ref_code_clean,
                "granted_credits": 5
            }).execute()
        except Exception:
            pass
            
        # Set referred_by on user
        try:
            supabase.table("users").update({"referred_by": referrer_id}).eq("id", referee_id).execute()
        except Exception:
            pass
        
        return {
            "success": True,
            "message": "Referral code applied! 5 free credits awarded to you and your referrer.",
            "credits_granted": 5,
            "new_balance": referee_new_bal
        }
    except Exception as e:
        return {"success": False, "message": str(e), "credits_granted": 0, "new_balance": 0}

from datetime import datetime, timedelta, timezone

import pytest
from services.auth_service import is_admin, _enforce_access


def test_is_admin_by_role():
    assert is_admin({"role": "admin", "email": "a@b.com"}) is True


def test_non_admin_role():
    assert is_admin({"role": "user", "email": "a@b.com"}) is False


def test_active_unlimited_passes():
    _enforce_access({"is_active": True, "access_expires_at": None})  # no raise


def test_inactive_blocked():
    with pytest.raises(PermissionError, match="revoked"):
        _enforce_access({"is_active": False})


def test_expired_blocked():
    past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    with pytest.raises(PermissionError, match="expired"):
        _enforce_access({"is_active": True, "access_expires_at": past})


def test_future_expiry_passes():
    future = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    _enforce_access({"is_active": True, "access_expires_at": future})  # no raise

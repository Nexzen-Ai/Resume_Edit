import pytest
from pydantic import ValidationError
from models.schemas import EditRequest, UserRegister


def test_jd_within_limit_ok():
    req = EditRequest(resume_id="r1", job_description="x" * 6000)
    assert len(req.job_description) == 6000


def test_jd_over_limit_rejected():
    with pytest.raises(ValidationError, match="6000 characters"):
        EditRequest(resume_id="r1", job_description="x" * 6001)


def test_priority_keywords_default_empty():
    req = EditRequest(resume_id="r1", job_description="hi")
    assert req.priority_keywords == []


def test_short_password_rejected():
    with pytest.raises(ValidationError, match="at least 8"):
        UserRegister(email="a@b.com", password="short", full_name="A B")


def test_blank_name_rejected():
    with pytest.raises(ValidationError, match="Full name"):
        UserRegister(email="a@b.com", password="longenough", full_name="   ")


def test_valid_registration_ok():
    u = UserRegister(email="a@b.com", password="longenough", full_name="  Anil  ")
    assert u.full_name == "Anil"

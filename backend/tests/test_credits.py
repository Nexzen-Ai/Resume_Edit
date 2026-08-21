from services.verification_service import generate_signature


def is_edu_domain(email: str) -> bool:
    domain = email.split("@")[-1].lower() if "@" in email else ""
    return domain.endswith(".edu") or "ac.in" in domain or "edu." in domain or "university" in domain or "college" in domain


def test_edu_domain_validation():
    assert is_edu_domain("student@stanford.edu") is True
    assert is_edu_domain("user@iitd.ac.in") is True
    assert is_edu_domain("applicant@gmail.com") is False


def test_signature_generation():
    sig1 = generate_signature("user123", "Docker & Kubernetes", 92.5)
    sig2 = generate_signature("user123", "Docker & Kubernetes", 92.5)
    sig3 = generate_signature("user456", "Docker & Kubernetes", 92.5)
    
    assert len(sig1) == 32
    assert sig1 == sig2
    assert sig1 != sig3

from services.ats_service import simulate_ats_parse


def test_ats_simulation():
    resume_text = "John Doe\nSoftware Engineer\nExperience: Worked with Python, Docker, PostgreSQL."
    job_description = "Seeking a Software Engineer skilled in Python, Docker, Kubernetes, and PostgreSQL."
    
    res = simulate_ats_parse(resume_text, job_description)
    assert res["overall_match_score"] > 0
    assert "python" in res["matched_keywords"] or "docker" in res["matched_keywords"]
    assert "kubernetes" in res["missing_keywords"]
    assert len(res["parsed_segments"]) > 0

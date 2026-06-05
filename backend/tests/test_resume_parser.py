import pytest
from services.resume_parser import strip_resume, extract_resume_text


def test_strip_removes_boilerplate():
    assert "references available upon request" not in strip_resume("Skills\nReferences available upon request.").lower()


def test_strip_collapses_blank_lines():
    assert strip_resume("A\n\n\n\nB") == "A\n\nB"


def test_strip_trims_trailing_whitespace_and_edges():
    assert strip_resume("  line one   \n  line two  ") == "line one\n  line two"


def test_legacy_doc_rejected_clearly():
    with pytest.raises(ValueError, match="docx"):
        extract_resume_text(b"anything", "old_resume.doc")


def test_unsupported_extension_rejected():
    with pytest.raises(ValueError, match="Unsupported"):
        extract_resume_text(b"anything", "resume.txt")

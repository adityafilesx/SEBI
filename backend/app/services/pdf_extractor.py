"""PDF text extractor using PyMuPDF.

Extracts real text, metadata, and page structure from uploaded SEBI PDFs.
Falls back to raw text if PyMuPDF is not available.
"""

from pathlib import Path


def extract_pdf_text(file_path: str) -> tuple[str, dict]:
    """Extract text and metadata from a PDF file.

    Returns:
        (full_text, metadata_dict)
    """
    path = Path(file_path)
    metadata = {"page_count": 0, "title": None}

    if not path.exists():
        return "", metadata

    # Try pypdf first
    try:
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        metadata["page_count"] = len(reader.pages)
        if reader.metadata and reader.metadata.title:
            metadata["title"] = reader.metadata.title

        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                pages_text.append(text)

        return "\n\n".join(pages_text), metadata

    except ImportError:
        # pypdf not available — try plain text
        pass

    # Fallback: try reading as plain text
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
        return text, metadata
    except Exception:
        return "", metadata

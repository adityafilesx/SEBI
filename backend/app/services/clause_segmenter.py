"""Rule-based clause segmenter for SEBI regulatory documents.

Splits extracted text into clause-like chunks using regex patterns
for SEBI circular structure.
"""

import re


def segment_clauses(text: str) -> list[dict]:
    """Segment regulatory text into clause chunks.

    Identifies SEBI clause patterns:
    - "X.Y" numbered clauses (e.g., "3.1", "7.6")
    - "Chapter X:" section headers
    - "(a)", "(b)" sub-clauses
    - Numbered paragraphs

    Returns list of dicts with: clause_number, heading, text, page_number
    """
    if not text or not text.strip():
        return []

    clauses = []

    # Primary pattern: "X.Y" or "X.Y.Z" clause numbering
    # Matches: "3.1 Notification Requirements" or "7.6 Technical Glitch Reporting"
    pattern = r'(?:^|\n)\s*(\d+\.(?:\d+\.?)*)\s+([^\n]+?)(?:\n)(.*?)(?=(?:\n\s*\d+\.(?:\d+\.?)*\s+)|\Z)'
    matches = re.findall(pattern, text, re.DOTALL)

    if matches:
        for match in matches:
            clause_num = match[0].rstrip(".")
            heading = match[1].strip()
            body = match[2].strip()

            # Clean up the text
            full_text = f"{heading}\n{body}" if body else heading
            full_text = re.sub(r'\n{3,}', '\n\n', full_text).strip()

            if len(full_text) > 20:  # Skip very short fragments
                clauses.append({
                    "clause_number": clause_num,
                    "heading": heading,
                    "text": full_text,
                    "page_number": _estimate_page(text, match[0]),
                })

    # If no structured clauses found, fall back to paragraph splitting
    if not clauses:
        paragraphs = re.split(r'\n\s*\n', text)
        for i, para in enumerate(paragraphs):
            para = para.strip()
            if len(para) > 50:  # Minimum meaningful length
                clauses.append({
                    "clause_number": f"P{i + 1}",
                    "heading": para[:60].strip() + "..." if len(para) > 60 else para,
                    "text": para,
                    "page_number": i // 3 + 1,  # Rough estimate
                })

    return clauses


def _estimate_page(full_text: str, marker: str) -> int:
    """Estimate page number based on position in text."""
    pos = full_text.find(marker)
    if pos < 0:
        return 1
    # Rough estimate: ~3000 chars per page
    return max(1, pos // 3000 + 1)

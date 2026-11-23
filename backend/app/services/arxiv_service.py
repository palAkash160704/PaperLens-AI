"""
arXiv service: normalize IDs, fetch metadata, and download PDFs.
"""

import re
from pathlib import Path

import arxiv

from app.core.config import RAW_DATA_DIR
from app.models.schemas import PaperMetadata

# Matches arXiv IDs like 1706.03762 or 1706.03762v2
_ARXIV_ID_RE = re.compile(r"(\d{4}\.\d{4,5})(v\d+)?")


def normalize_arxiv_id(url_or_id: str) -> str:
    """
    Extract the base arXiv paper ID from a raw ID string or URL.

    Accepts:
        - "1706.03762"
        - "1706.03762v2"
        - "https://arxiv.org/abs/1706.03762"
        - "https://arxiv.org/pdf/1706.03762.pdf"
        - "https://arxiv.org/pdf/1706.03762v2"

    Returns:
        The base ID without version suffix, e.g. "1706.03762".

    Raises:
        ValueError: if no valid arXiv ID can be extracted.
    """
    match = _ARXIV_ID_RE.search(url_or_id.strip())
    if not match:
        raise ValueError(f"Could not extract a valid arXiv ID from: {url_or_id}")
    return match.group(1)


def fetch_arxiv_paper(url_or_id: str) -> tuple[PaperMetadata, Path]:
    """
    Fetch metadata and download the PDF for an arXiv paper.

    Args:
        url_or_id: An arXiv paper ID or URL.

    Returns:
        A tuple of (PaperMetadata, path_to_downloaded_pdf).

    Raises:
        ValueError: Invalid arXiv ID format.
        LookupError: Paper not found on arXiv.
        RuntimeError: PDF download failure.
    """
    paper_id = normalize_arxiv_id(url_or_id)

    # Query arXiv API
    client = arxiv.Client()
    search = arxiv.Search(id_list=[paper_id])
    results = list(client.results(search))

    if not results:
        raise LookupError(f"No arXiv paper found for ID: {paper_id}")

    paper = results[0]

    # Download PDF using paper.download_pdf (or urllib fallback if newer arxiv)
    try:
        if hasattr(paper, "download_pdf"):
            downloaded = paper.download_pdf(
                dirpath=str(RAW_DATA_DIR),
                filename=f"{paper_id}.pdf",
            )
            pdf_path = Path(downloaded)
        else:
            import urllib.request
            dest = RAW_DATA_DIR / f"{paper_id}.pdf"
            urllib.request.urlretrieve(paper.pdf_url, dest)
            pdf_path = dest
    except Exception as exc:
        raise RuntimeError(
            f"Failed to download PDF for {paper_id}: {exc}"
        ) from exc

    metadata = PaperMetadata(
        paper_id=paper_id,
        title=paper.title,
        authors=[str(a) for a in paper.authors],
        abstract=paper.summary or "",
        published_date=paper.published.isoformat() if paper.published else "",
        pdf_url=paper.pdf_url or "",
        source="arxiv",
    )

    return metadata, pdf_path

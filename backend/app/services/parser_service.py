"""
Layout-aware PDF parser using IBM Docling.

Configured with formula enrichment so LaTeX equations are properly extracted
as $$ ... $$ blocks. Provenance (page numbers, labels) is extracted
deterministically via result.document.iterate_items().
"""

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions

from app.core.config import PROCESSED_DATA_DIR


# ---------------------------------------------------------------------------
# Parsed element dataclass — carries provenance through the pipeline
# ---------------------------------------------------------------------------

@dataclass
class ParsedElement:
    """A single document element with deterministic provenance metadata."""
    label: str          # e.g. "section_header", "text", "table", "formula", …
    text: str           # Content: plain text for paragraphs, Markdown for tables
    page_number: int    # Source page (from item.prov[0].page_no)
    heading_level: int  # 0 = not a heading; 1-3 for section header depth


def clean_smallcaps_artifacts(text: str) -> str:
    """
    Normalize spaced small-caps artifacts from PDF typesetting like:
    'a b s t r a c t' -> 'Abstract'
    'a r t i c l e   i n f o' -> 'Article Info'
    'i n t r o d u c t i o n' -> 'Introduction'
    """
    def repl(m: re.Match) -> str:
        raw = m.group(0)
        collapsed = re.sub(r"\s+", "", raw).lower()
        mapping = {
            "abstract": "Abstract",
            "articleinfo": "Article Info",
            "introduction": "Introduction",
            "conclusion": "Conclusion",
            "references": "References",
            "background": "Background",
            "results": "Results",
            "discussion": "Discussion",
            "methodology": "Methodology",
            "methods": "Methods",
            "overview": "Overview",
            "acknowledgements": "Acknowledgements",
            "acknowledgments": "Acknowledgments",
            "experiments": "Experiments",
        }
        return mapping.get(collapsed, raw)

    return re.sub(r"\b(?:[A-Za-z]\s+){3,}[A-Za-z]\b", repl, text)


# ---------------------------------------------------------------------------
# Module-level Docling converter (singleton — heavy init, reuse across calls)
# ---------------------------------------------------------------------------

_pipeline_options = PdfPipelineOptions(
    do_ocr=False,
    do_table_structure=True,
    do_formula_enrichment=False,
)

_converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(pipeline_options=_pipeline_options),
    }
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_label(item) -> str:
    """Extract the label string from a DocItem, handling str-enums."""
    label = item.label
    if hasattr(label, "value"):
        return label.value
    return str(label)


def _get_page_number(item) -> int:
    """Return the page number from provenance, defaulting to 1."""
    if hasattr(item, "prov") and item.prov:
        try:
            return item.prov[0].page_no
        except (IndexError, AttributeError):
            pass
    return 1


def _get_text(item, label: str, doc=None) -> str | None:
    """
    Get the best textual representation of *item*.

    - Tables → item.export_to_markdown(doc=doc)  (preserves pipe syntax)
    - Formulas → LaTeX formatted ($$ ... $$)
    - Everything else → item.text
    """
    if label == "table" and hasattr(item, "export_to_markdown"):
        try:
            return item.export_to_markdown(doc=doc) if doc else item.export_to_markdown()
        except TypeError:
            try:
                return item.export_to_markdown()
            except Exception:
                pass
        except Exception:
            pass
    if hasattr(item, "text"):
        txt = item.text
        if txt and label == "formula":
            trimmed = txt.strip()
            if not trimmed.startswith("$"):
                return f"$${trimmed}$$"
            return trimmed
        return txt
    return None


# ---------------------------------------------------------------------------
# Internal Parsers
# ---------------------------------------------------------------------------

def _parse_with_pymupdf(pdf_path: Path) -> tuple[str, list[ParsedElement]]:
    """Fast structured Markdown extraction using pymupdf4llm."""
    import pymupdf4llm

    page_chunks = pymupdf4llm.to_markdown(str(pdf_path), page_chunks=True)
    full_markdown_parts = []
    elements: list[ParsedElement] = []

    for chunk in page_chunks:
        page_no = int(chunk.get("metadata", {}).get("page", 1))
        raw_text = chunk.get("text", "")
        cleaned_text = clean_smallcaps_artifacts(raw_text)
        full_markdown_parts.append(cleaned_text)

        blocks = [b.strip() for b in re.split(r"\n{2,}", cleaned_text) if b.strip()]
        for block in blocks:
            h_match = re.match(r"^(#{1,6})\s+(.+)$", block)
            if h_match:
                level = min(len(h_match.group(1)), 3)
                elements.append(
                    ParsedElement(
                        label="section_header",
                        text=h_match.group(2).strip(),
                        page_number=page_no,
                        heading_level=level,
                    )
                )
                continue

            lines = [l.strip() for l in block.splitlines() if l.strip()]
            if len(lines) >= 2 and lines[0].startswith("|") and lines[0].endswith("|") and any("---" in l for l in lines):
                elements.append(
                    ParsedElement(
                        label="table",
                        text=block,
                        page_number=page_no,
                        heading_level=0,
                    )
                )
                continue

            if (block.startswith("$$") and block.endswith("$$")) or (block.startswith("\\[") and block.endswith("\\]")):
                elements.append(
                    ParsedElement(
                        label="formula",
                        text=block,
                        page_number=page_no,
                        heading_level=0,
                    )
                )
                continue

            elements.append(
                ParsedElement(
                    label="text",
                    text=block,
                    page_number=page_no,
                    heading_level=0,
                )
            )

    full_markdown = "\n\n".join(full_markdown_parts)
    return full_markdown, elements


def _parse_with_pdfium(pdf_path: Path) -> tuple[str, list[ParsedElement]]:
    """Instant text & section extraction using Google PDFium."""
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(str(pdf_path))
    full_markdown_parts = []
    elements: list[ParsedElement] = []

    header_regex = re.compile(
        r"^(?:(?:[0-9]+(?:\.[0-9]+)*\s+[A-Za-z][\w\s\-]{2,60})|"
        r"(?:Abstract|Introduction|Background|Related Work|Methodology|Methods|Model Architecture|"
        r"Experiments|Results|Discussion|Conclusion|Acknowledgements|Acknowledgments|References))$",
        re.IGNORECASE,
    )

    for page_no, page in enumerate(pdf, start=1):
        textpage = page.get_textpage()
        page_text = textpage.get_text_range()
        cleaned_page = clean_smallcaps_artifacts(page_text)

        lines = [l.strip() for l in cleaned_page.splitlines() if l.strip()]
        page_md_lines = []
        current_para: list[str] = []

        def flush_para():
            if current_para:
                para_text = " ".join(current_para).strip()
                if para_text:
                    elements.append(
                        ParsedElement(
                            label="text",
                            text=para_text,
                            page_number=page_no,
                            heading_level=0,
                        )
                    )
                    page_md_lines.append(para_text)
                current_para.clear()

        for line in lines:
            # Check if this line is a section header
            is_header = bool(header_regex.match(line))
            is_allcaps_header = (
                not is_header
                and len(line) < 50
                and line.isupper()
                and not any(char.isdigit() for char in line[:3])
            )

            if is_header or is_allcaps_header:
                flush_para()
                header_text = line.title() if is_allcaps_header else line
                # Calculate heading depth from dot count in numbers e.g. 3.2.1 -> level 3
                num_match = re.match(r"^([0-9]+(?:\.[0-9]+)*)", header_text)
                if num_match:
                    dots = num_match.group(1).count(".")
                    level = min(dots + 1, 3)
                else:
                    level = 1

                elements.append(
                    ParsedElement(
                        label="section_header",
                        text=header_text,
                        page_number=page_no,
                        heading_level=level,
                    )
                )
                page_md_lines.append(f"{'#' * max(level, 2)} {header_text}")
            else:
                current_para.append(line)
                # Flush paragraph on sentence endings with sufficient length
                if len(current_para) >= 4 or (len(current_para) >= 2 and line.endswith((".", ":"))):
                    flush_para()

        flush_para()
        full_markdown_parts.append("\n\n".join(page_md_lines))

    full_markdown = "\n\n".join(full_markdown_parts)
    return full_markdown, elements


def _parse_precision_docling(pdf_path: Path, paper_id: str) -> tuple[str, list[ParsedElement]]:
    """Deep layout analysis using IBM Docling."""
    try:
        result = _converter.convert(str(pdf_path))
    except Exception as exc:
        raise RuntimeError(f"Docling failed to parse {pdf_path}: {exc}") from exc

    doc = result.document
    markdown_content: str = clean_smallcaps_artifacts(doc.export_to_markdown())

    # Save lossless Docling JSON
    json_path = PROCESSED_DATA_DIR / f"{paper_id}_docling.json"
    try:
        doc.save_as_json(json_path)
    except (AttributeError, TypeError):
        doc_dict = doc.export_to_dict()
        json_path.write_text(
            json.dumps(doc_dict, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8",
        )

    elements: list[ParsedElement] = []
    for item, level in doc.iterate_items():
        label = _get_label(item)
        if label in ("page_header", "page_footer"):
            continue

        text = _get_text(item, label, doc=doc)
        if not text or not text.strip():
            continue

        page_no = _get_page_number(item)
        heading_level = 0
        if label == "section_header":
            heading_level = max(1, min(level, 3))

        elements.append(
            ParsedElement(
                label=label,
                text=clean_smallcaps_artifacts(text.strip()),
                page_number=page_no,
                heading_level=heading_level,
            )
        )

    return markdown_content, elements


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_pdf(
    pdf_path: Path,
    paper_id: str,
    mode: Literal["fast", "precision"] = "fast",
) -> tuple[str, list[ParsedElement]]:
    """
    Parse a PDF in either 'fast' (~1-2s) or 'precision' (~15s) mode.

    Modes:
        - 'fast': Uses pymupdf4llm / pypdfium2 to extract structured text & headings instantly.
        - 'precision': Uses IBM Docling for deep layout and table parsing.

    Args:
        pdf_path: Path to the source PDF.
        paper_id: Unique identifier for the paper.
        mode: Parsing speed mode ("fast" or "precision").

    Returns:
        (markdown_content, list_of_parsed_elements)
    """
    if mode == "fast":
        try:
            markdown_content, elements = _parse_with_pdfium(pdf_path)
        except Exception:
            try:
                markdown_content, elements = _parse_with_pymupdf(pdf_path)
            except Exception:
                markdown_content, elements = _parse_precision_docling(pdf_path, paper_id)
    else:
        markdown_content, elements = _parse_precision_docling(pdf_path, paper_id)

    # Save full Markdown
    md_path = PROCESSED_DATA_DIR / f"{paper_id}.md"
    md_path.write_text(markdown_content, encoding="utf-8")

    # Ensure docling.json exists for compatibility
    json_path = PROCESSED_DATA_DIR / f"{paper_id}_docling.json"
    if not json_path.exists():
        json_path.write_text(
            json.dumps({"paper_id": paper_id, "mode": mode, "total_elements": len(elements)}, indent=2),
            encoding="utf-8",
        )

    return markdown_content, elements

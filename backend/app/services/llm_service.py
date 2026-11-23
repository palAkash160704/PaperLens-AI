"""
Unified LLM service supporting Gemini, Groq, and offline extractive fallback.
"""

from __future__ import annotations

import logging
import re
from typing import Final

from app.core.config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    LLM_PROVIDER,
)

logger = logging.getLogger(__name__)

_SUMMARY_PROMPT_TEMPLATE: Final[str] = (
    "You are a principal AI researcher summarizing research paper sections for a hierarchical RAG index.\n"
    "Generate a concise, technical 3 to 5 sentence summary of the following section from the paper '{paper_title}'.\n"
    "Crucial rules:\n"
    "1. Preserve exact quantitative metrics, mathematical formulations, model dimensions, and benchmark scores.\n"
    "2. Explicitly mention key algorithms, architectural components, or dataset names.\n"
    "3. Keep the output strictly factual, clear, and under 150 words.\n\n"
    "Section: {section_header}\n"
    "Content:\n{content}\n\n"
    "Summary:"
)


def _extractive_fallback_summary(content: str, section_header: str, paper_title: str) -> str:
    """
    Generate a clean, deterministic extractive summary when no LLM API key is present.
    Extracts key informative sentences, preserving equations and metrics.
    """
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    if not paragraphs:
        return f"[Summary of {section_header}]: {content[:300]}"

    extracted_sentences: list[str] = []

    # Regex for sentence splitting that avoids splitting on decimal numbers (e.g. 28.4)
    sentence_pattern = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9$|])")

    for para in paragraphs:
        # If it's a table or equation block, retain a snippet
        if para.startswith("|") or para.startswith("$$"):
            lines = [line.strip() for line in para.split("\n") if line.strip()]
            extracted_sentences.append(" ".join(lines[:3]))
            continue

        sentences = sentence_pattern.split(para)
        for s in sentences:
            s_clean = s.strip()
            if len(s_clean) > 25 and not s_clean.startswith("#"):
                extracted_sentences.append(s_clean)
                if len(extracted_sentences) >= 4:
                    break
        if len(extracted_sentences) >= 4:
            break

    summary_body = " ".join(extracted_sentences[:4])
    return f"Section '{section_header}' in '{paper_title}' establishes: {summary_body}"


def generate_summary(content: str, section_header: str, paper_title: str) -> str:
    """
    Generate a concise, technical 3-5 sentence summary using the configured LLM provider,
    falling back to deterministic extractive summarization if no keys or providers are available.
    """
    prompt = _SUMMARY_PROMPT_TEMPLATE.format(
        paper_title=paper_title,
        section_header=section_header,
        content=content[:5000],  # Bound context window to fit rate limits
    )

    # 1. Gemini Provider
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY, http_options={"api_version": "v1beta"})
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as exc:
            error_msg = f"[LLM API Error] Gemini generation failed with {type(exc).__name__}: {exc}"
            logger.error(error_msg, exc_info=True)
            print(error_msg)

    # 2. Groq Provider (OpenAI-compatible client)
    elif LLM_PROVIDER == "groq" and GROQ_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=GROQ_API_KEY,
            )
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                temperature=0.2,
                max_tokens=300,
            )
            if chat_completion.choices and chat_completion.choices[0].message.content:
                return chat_completion.choices[0].message.content.strip()
        except Exception as exc:
            error_msg = f"[LLM API Notice] Groq generation falling back to extractive: {exc}"
            logger.warning(error_msg)

    # 3. Deterministic Extractive Fallback (Critical Safeguard)
    return _extractive_fallback_summary(content, section_header, paper_title)


# ---------------------------------------------------------------------------
# Phase 3 Structured Output Generation (Gemini, Groq, and Fallback)
# ---------------------------------------------------------------------------

from typing import Callable, TypeVar
from pydantic import BaseModel
import json

T = TypeVar("T", bound=BaseModel)


def generate_structured(
    system_prompt: str,
    user_prompt: str,
    schema_cls: type[T],
    fallback_fn: Callable[[], T],
) -> T:
    """
    Generate structured output adhering strictly to schema_cls.
    Supports Gemini (via native response_schema), Groq (via JSON mode),
    and falls back to deterministic fallback_fn if unconfigured or on error.
    """
    # 1. Gemini Provider
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY, http_options={"api_version": "v1beta"})
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema_cls,
                temperature=0.1,
                system_instruction=system_prompt,
            )
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=user_prompt,
                config=config,
            )
            if response and response.text:
                return schema_cls.model_validate_json(response.text)
        except Exception as exc:
            error_msg = f"[LLM API Error] Gemini structured generation failed with {type(exc).__name__}: {exc}"
            logger.error(error_msg, exc_info=True)
            print(error_msg)

    # 2. Groq Provider (OpenAI-compatible client)
    elif LLM_PROVIDER == "groq" and GROQ_API_KEY:
        try:
            from openai import OpenAI

            client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=GROQ_API_KEY,
            )
            schema_json = json.dumps(schema_cls.model_json_schema())
            full_system = f"{system_prompt}\n\nYou MUST respond with valid JSON adhering strictly to this JSON schema:\n{schema_json}"

            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": full_system},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            if completion.choices and completion.choices[0].message.content:
                return schema_cls.model_validate_json(completion.choices[0].message.content)
        except Exception as exc:
            error_msg = f"[LLM API Error] Groq structured generation failed with {type(exc).__name__}: {exc}"
            logger.error(error_msg, exc_info=True)
            print(error_msg)

    # 3. Deterministic Offline Fallback (Guarantees zero-crash operation)
    return fallback_fn()


def get_active_llm_status() -> dict[str, str | bool]:
    """
    Return active LLM provider and whether a live API key is configured.
    """
    is_live = False
    if LLM_PROVIDER == "gemini" and bool(GEMINI_API_KEY):
        is_live = True
    elif LLM_PROVIDER == "groq" and bool(GROQ_API_KEY):
        is_live = True

    return {
        "provider": LLM_PROVIDER,
        "live_llm_enabled": is_live,
    }



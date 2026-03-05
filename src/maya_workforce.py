"""
MAYA OWL Workforce — Google Gemini Edition
==========================================
Multi-agent system using 3 specialized Gemini agents:
  - Researcher  → searches web, gathers facts
  - Strategist  → writes content / marketing copy
  - Analyst     → runs Python code, crunches data

Setup:
    pip install google-genai python-dotenv duckduckgo-search

Usage:
    python src/maya_workforce.py
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()  # reads GOOGLE_API_KEY from .env

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MAYA_OWL")

try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.error("google-genai not installed. Run: pip install google-genai")

try:
    from duckduckgo_search import DDGS
    SEARCH_AVAILABLE = True
except ImportError:
    SEARCH_AVAILABLE = False
    logger.warning("duckduckgo-search not installed. Search tool disabled. Run: pip install duckduckgo-search")


# ── Tool: web search ─────────────────────────────────────────────────────────

def web_search(query: str, max_results: int = 5) -> str:
    """Search the web and return summarised results."""
    if not SEARCH_AVAILABLE:
        return f"[Search unavailable] Would have searched: {query}"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        if not results:
            return "No results found."
        lines = [f"- {r['title']}: {r['body'][:200]}" for r in results]
        return "\n".join(lines)
    except Exception as e:
        return f"Search error: {e}"


# ── Agent base ────────────────────────────────────────────────────────────────

class GeminiAgent:
    """A single specialised Gemini agent."""

    def __init__(self, client, name: str, system_prompt: str):
        self.client = client
        self.name = name
        self.system_prompt = system_prompt

    def run(self, user_message: str) -> str:
        logger.info(f"[{self.name}] Processing...")
        response = self.client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_message,
            config=genai_types.GenerateContentConfig(
                system_instruction=self.system_prompt,
                temperature=0.6,
            ),
        )
        result = response.text.strip()
        logger.info(f"[{self.name}] Done ({len(result)} chars)")
        return result


# ── Multi-agent Workforce ─────────────────────────────────────────────────────

class MayaOWLWorkforce:
    """
    MAYA OWL Workforce — 3 Gemini agents collaborating on a task.

    Flow:  Researcher → Strategist → Analyst (if needed)
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GOOGLE_API_KEY not set.\n"
                "Get a free key at https://aistudio.google.com/\n"
                "Then add it to .env: GOOGLE_API_KEY=your-key"
            )
        if not GENAI_AVAILABLE:
            raise ImportError("Run: pip install google-genai")

        self.client = genai.Client(api_key=self.api_key)
        self._build_agents()
        logger.info("✅ MAYA OWL Workforce ready (3 Gemini agents)")

    def _build_agents(self):
        self.researcher = GeminiAgent(
            self.client,
            name="Researcher",
            system_prompt=(
                "You are MAYA's Expert Researcher. "
                "You receive a task and raw web search results. "
                "Synthesise the information into clear, factual bullet points. "
                "Always cite sources when available. Be concise and accurate."
            ),
        )
        self.strategist = GeminiAgent(
            self.client,
            name="Content Strategist",
            system_prompt=(
                "You are MAYA's Content Strategist. "
                "You receive research findings and transform them into polished, "
                "engaging content — social media posts, blog summaries, or marketing copy. "
                "Optimise for the target platform. Use emojis and hashtags where appropriate. "
                "Be creative but professional."
            ),
        )
        self.analyst = GeminiAgent(
            self.client,
            name="Data Analyst",
            system_prompt=(
                "You are MAYA's Data Analyst. "
                "You review the final content and provide a brief quality assessment: "
                "engagement score (1-10), suggested improvements, and best posting time. "
                "Keep it concise — bullet points only."
            ),
        )

    def process_task(self, task: str) -> str:
        """
        Run the full 3-agent pipeline on a task.
        Returns the final synthesised result.
        """
        logger.info(f"🚀 Task received: {task[:80]}...")

        # Step 1 — Researcher gathers info
        search_results = web_search(task)
        research_prompt = (
            f"Task: {task}\n\n"
            f"Web search results:\n{search_results}\n\n"
            "Summarise the key findings relevant to this task."
        )
        research = self.researcher.run(research_prompt)
        logger.info("📚 Research complete")

        # Step 2 — Strategist writes content
        strategy_prompt = (
            f"Original task: {task}\n\n"
            f"Research findings:\n{research}\n\n"
            "Create the best possible content for this task."
        )
        content = self.strategist.run(strategy_prompt)
        logger.info("✍️  Content created")

        # Step 3 — Analyst reviews
        analysis_prompt = (
            f"Review this content:\n\n{content}\n\n"
            "Provide: engagement score, 2-3 improvement tips, best posting time."
        )
        analysis = self.analyst.run(analysis_prompt)
        logger.info("📊 Analysis complete")

        # Combine output
        return (
            f"## Research\n{research}\n\n"
            f"## Content\n{content}\n\n"
            f"## Quality Analysis\n{analysis}"
        )


# ── Local test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  MAYA OWL Workforce — Google Gemini Edition")
    print("=" * 60)

    try:
        workforce = MayaOWLWorkforce()
    except (ValueError, ImportError) as e:
        print(f"\n❌ {e}")
        exit(1)

    task = (
        "Search the web for the latest trends in 'AI agents 2025'. "
        "Summarise the findings and write an engaging LinkedIn post about it."
    )

    print(f"\n📋 Task:\n  {task}\n")
    print("-" * 60)

    result = workforce.process_task(task)

    print("\n" + "=" * 60)
    print("  FINAL RESULT")
    print("=" * 60)
    print(result)

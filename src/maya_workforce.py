import os
import logging
from typing import List, Dict, Any, Optional

# We wrap camel imports in try-except in case it's not installed yet.
# Install with: pip install "camel-ai[all]"
try:
    from camel.agents import ChatAgent
    from camel.societies.workforce import Workforce
    from camel.tasks import Task
    from camel.models import ModelFactory
    from camel.types import ModelPlatformType, ModelType
    from camel.toolkits import (
        SearchToolkit,
        CodeExecutionToolkit,
    )
    CAMEL_AVAILABLE = True
except ImportError:
    CAMEL_AVAILABLE = False
    logging.warning(
        "camel-ai is not installed. Run: pip install 'camel-ai[all]'"
    )

logger = logging.getLogger("MAYA_OWL_Workforce")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


class MayaOWLWorkforce:
    """
    MAYA's OWL (Optimized Workforce Learning) Multi-Agent System.
    Uses Google Gemini — no OpenAI key needed.

    Setup:
        pip install "camel-ai[all]"
        export GOOGLE_API_KEY="your-gemini-key"   # free at aistudio.google.com

    Usage:
        workforce = MayaOWLWorkforce()
        result = workforce.process_task("Research and write a LinkedIn post about AI in 2025")
        print(result)
    """

    def __init__(self, api_key: str = None):
        # Uses Google Gemini — get free key at https://aistudio.google.com/
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            logger.warning(
                "GOOGLE_API_KEY is missing. Get a free key at https://aistudio.google.com/\n"
                "Then: export GOOGLE_API_KEY='your-key-here'"
            )

        self.workforce = None
        if CAMEL_AVAILABLE:
            self._initialize_workforce()
        else:
            logger.error("camel-ai not installed. Run: pip install 'camel-ai[all]'")

    def _initialize_workforce(self):
        """Initializes the multi-agent Workforce with Gemini Flash (fast + free tier)."""
        try:
            # Google Gemini Flash — fast, cheap, free tier available
            model = ModelFactory.create(
                model_platform=ModelPlatformType.GOOGLE,
                model_type=ModelType.GEMINI_2_0_FLASH,
                model_config_dict={
                    "temperature": 0.5,
                    "api_key": self.api_key,
                },
            )

            # Tools — search only (no playwright/browser needed for local testing)
            search_tools = [
                SearchToolkit().search_duckduckgo,
                SearchToolkit().search_wiki,
            ]

            code_tools = CodeExecutionToolkit(sandbox="subprocess").get_tools()

            # ── Agent 1: Researcher ──────────────────────────────────────────
            researcher_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Expert Researcher. Your job is to search the web "
                    "and gather accurate, up-to-date data regarding the user's task. "
                    "Always cite sources and verify facts before passing results to the next agent."
                ),
                model=model,
                tools=search_tools,
            )

            # ── Agent 2: Content Strategist ──────────────────────────────────
            strategist_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Content Strategist. Your job is to take raw research "
                    "and transform it into highly engaging content — social media posts, "
                    "blogs, or marketing copy. Optimize for virality, include relevant "
                    "emojis and hashtags, and tailor tone to the platform."
                ),
                model=model,
            )

            # ── Agent 3: Data Analyst ────────────────────────────────────────
            analyst_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Data Analyst. You can write and execute Python code "
                    "to process metrics, analyze trends, or handle CSV/JSON data. "
                    "Always return clean, actionable insights."
                ),
                model=model,
                tools=code_tools,
            )

            # ── Build the Workforce ──────────────────────────────────────────
            self.workforce = Workforce("MAYA_OWL_Workforce")

            self.workforce.add_single_agent_worker(
                "Researcher",
                worker=researcher_agent,
                description="Searches the web and gathers accurate information for any topic.",
            )
            self.workforce.add_single_agent_worker(
                "Content Strategist",
                worker=strategist_agent,
                description="Transforms research into polished marketing content and social media posts.",
            )
            self.workforce.add_single_agent_worker(
                "Data Analyst",
                worker=analyst_agent,
                description="Writes and runs Python code to analyse data and compute metrics.",
            )

            logger.info("✅ MAYA OWL Workforce initialized with Gemini Flash (3 agents ready).")

        except Exception as e:
            logger.error(f"Failed to initialize OWL Workforce: {e}")
            self.workforce = None

    def process_task(self, task_description: str) -> str:
        """
        Submit a task to the OWL Workforce.
        The workforce manager automatically splits the task and routes sub-tasks to agents.

        Args:
            task_description: Plain-English description of what you want done.

        Returns:
            Final synthesized result as a string.
        """
        if not self.workforce:
            return "❌ Workforce not initialized. Check GOOGLE_API_KEY and camel-ai installation."

        try:
            logger.info(f"🚀 Submitting task to OWL Workforce:\n  {task_description}")
            task = Task(content=task_description, id="maya_task_001")
            result = self.workforce.process_task(task)
            logger.info("✅ Task completed by OWL Workforce.")
            return result.result

        except Exception as e:
            logger.error(f"Error processing task: {e}")
            return f"Error: {str(e)}"


# ── Quick local test ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  MAYA OWL Workforce — Google Gemini Edition")
    print("=" * 60)

    if not os.getenv("GOOGLE_API_KEY"):
        print("\n⚠  GOOGLE_API_KEY not set!")
        print("   Get a free key at: https://aistudio.google.com/")
        print("   Then run:  set GOOGLE_API_KEY=your-key-here  (Windows)")
        print("          or: export GOOGLE_API_KEY=your-key-here  (Linux)")
        exit(1)

    maya_owl = MayaOWLWorkforce()

    sample_task = (
        "Search the web for the latest trends in 'AI agents 2025'. "
        "Summarize key findings and write an engaging LinkedIn post about it."
    )

    print(f"\n📋 Sample Task:\n  {sample_task}\n")
    result = maya_owl.process_task(sample_task)
    print("\n--- RESULT ---")
    print(result)

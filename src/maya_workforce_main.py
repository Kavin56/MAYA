import os
import logging
from typing import List, Dict, Any, Optional

# We wrap camel imports in try-except in case it's not installed yet,
# but we are designing it to be the core of MAYA's new OWL capability.
try:
    from camel.agents import ChatAgent
    from camel.societies.workforce import Workforce
    from camel.tasks import Task
    from camel.models import ModelFactory
    from camel.types import ModelPlatformType, ModelType
    from camel.toolkits import (
        BrowserToolkit,
        SearchToolkit,
        CodeExecutionToolkit,
        DocumentProcessingToolkit,
    )
except ImportError:
    logging.warning(
        "camel-ai is not installed. Please run `pip install camel-ai` to use OWL features."
    )

logger = logging.getLogger("MAYA_OWL_Workforce")


class MayaOWLWorkforce:
    """
    MAYA's integration with the OWL (Optimized Workforce Learning) Multi-Agent System.
    This replaces the single-agent approach with a highly capable collaborative workforce.
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning(
                "OPENAI_API_KEY is missing. OWL Workforce requires an LLM API key."
            )

        self.workforce = None
        self._initialize_workforce()

    def _initialize_workforce(self):
        """Initializes the multi-agent society (Workforce) with specific roles and tools."""
        try:
            # Set up the LLM Model (Defaulting to OpenAI GPT-4o for optimal OWL performance)
            model = ModelFactory.create(
                model_platform=ModelPlatformType.OPENAI,
                model_type=ModelType.GPT_4O,
                model_config_dict={"temperature": 0.5},
            )

            # 1. Initialize Toolkits for MAYA's Agents
            search_tools = [
                SearchToolkit().search_google,
                SearchToolkit().search_duckduckgo,
                SearchToolkit().search_wiki,
            ]

            # Note: Playwright needs to be installed via `playwright install` for BrowserToolkit
            browser_tools = BrowserToolkit(headless=True).get_tools()

            document_tools = DocumentProcessingToolkit().get_tools()

            # 2. Create Specialized Agents

            # Agent 1: The Researcher (Browses web, reads documents)
            researcher_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Expert Researcher. Your job is to search the web, "
                    "read articles, and gather accurate data regarding the user's task. "
                    "Always verify facts before passing them to the content strategist."
                ),
                model=model,
                tools=search_tools + browser_tools + document_tools,
            )

            # Agent 2: The Content Strategist (Writes and optimizes social media posts)
            strategist_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Content Strategist. Your job is to take raw research "
                    "and turn it into highly engaging social media posts, blogs, or marketing "
                    "copy. Optimize for virality and include appropriate emojis and hashtags."
                ),
                model=model,
            )

            # Agent 3: The Data Analyst (Executes code for analytics or data processing)
            analyst_agent = ChatAgent(
                system_message=(
                    "You are MAYA's Data Analyst. You can write and execute Python code "
                    "to process metrics, analyze social media trends, or handle CSV/JSON data."
                ),
                model=model,
                tools=CodeExecutionToolkit(sandbox="subprocess").get_tools(),
            )

            # 3. Form the Workforce (The core OWL concept)
            self.workforce = Workforce("MAYA_OWL_Workforce")

            # Add agents to the workforce
            self.workforce.add_single_agent_worker(
                "Researcher",
                worker=researcher_agent,
                description="Expert in web search, browsing, and reading documents to gather information.",
            )

            self.workforce.add_single_agent_worker(
                "Content Strategist",
                worker=strategist_agent,
                description="Expert in writing marketing copy, social media posts, and formatting output.",
            )

            self.workforce.add_single_agent_worker(
                "Data Analyst",
                worker=analyst_agent,
                description="Expert in writing python code to analyze data, trends, or perform calculations.",
            )

            logger.info(
                "Γ£à MAYA OWL Workforce initialized successfully with 3 specialized agents."
            )

        except Exception as e:
            logger.error(f"Failed to initialize OWL Workforce: {e}")

    def process_task(self, task_description: str) -> str:
        """
        Submits a task to the OWL Workforce and returns the final synthesized result.
        """
        if not self.workforce:
            return "Error: Workforce not initialized. Please check API keys and dependencies."

        try:
            logger.info(f"Submitting task to OWL Workforce: {task_description}")

            # Create a Task object
            task = Task(content=task_description, id="maya_task_001")

            # Run the workforce
            # The workforce manager will automatically route sub-tasks to the correct agents
            result = self.workforce.process_task(task)

            logger.info("Γ£à Task completed by OWL Workforce")
            return result.result

        except Exception as e:
            logger.error(f"Error processing task with OWL Workforce: {e}")
            return f"Error processing task: {str(e)}"


# Example usage for testing locally
if __name__ == "__main__":
    # Ensure OPENAI_API_KEY is set in environment
    print("Testing MAYA's OWL Workforce Integration...")
    maya_owl = MayaOWLWorkforce()

    # Test task
    sample_task = (
        "Search the web for the latest updates on 'AI in Digital Marketing 2025'. "
        "Summarize the findings and draft a highly engaging LinkedIn post."
    )

    # result = maya_owl.process_task(sample_task)
    # print("\n--- FINAL RESULT ---\n")
    # print(result)
    print("Workforce setup is ready. Run with API key to execute tasks.")

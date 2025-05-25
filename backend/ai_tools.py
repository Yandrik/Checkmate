import urllib.parse
from langchain.chat_models import init_chat_model
from litellm import completion
from qwen_agent.tools.base import BaseTool, register_tool  # type: ignore
import json5
from result import Ok
from prompts import FACT_CHECK_AGENT_SYSTEM_PROMPT
from search import search


from models import AiSettings  
settings = AiSettings()  # type: ignore


@register_tool("fact_check")
class FactChecker(BaseTool):
    """
    A tool that checks the factuality of a given text.
    Give the tool the text, and it will return a verdict and sources.
    """

    description = "A tool that checks the factuality of a given text based on a web search. Give the tool the text and the search query to search for, and it will return a verdict, and sources."

    parameters = [
        {
            "name": "prompt",
            "type": "string",
            "description": "Text to check for factuality",
            "required": True,
        },
        {
            "name": "search_query",
            "type": "string",
            "description": "Query to search for relevant information for fact-checking using a web search engine",
            "required": True,
        },
    ]

    def call(self, params: str, **kwargs) -> str:  # type: ignore
        """
        Call the fact-checking tool with the provided parameters.
        :param params: JSON string containing the parameters for the tool.
        :return: JSON string with the fact-checking result.
        """
        data = json5.loads(params)
        if not isinstance(data, dict) or "prompt" not in data or "search_query" not in data:
            raise ValueError("Invalid params: expected a dict with 'prompt' and 'search_query' keys")
        
        prompt = urllib.parse.quote(data["prompt"])
        search_query = urllib.parse.quote(data["search_query"])

        search_result = search(query=search_query, num_results=5)  
        
        if isinstance(search_result, Ok):
            try:
                result = completion(
                    model= 'openrouter/' + settings.model,
                    messages=[
                        {
                            "role": "system",
                            "content": FACT_CHECK_AGENT_SYSTEM_PROMPT,
                        },
                        {
                            "role": "user",
                            "content": f"Factoid: \"{prompt}\"\n\n=== Web Search (Query: \"{search_query}\")===\n{search_result.ok_value}\n\nPlease fact-check the above factoid based on the web search results. Provide a JSON response based on the Answer schema.",
                        },
                    ],
                    max_tokens=1000,
                    api_key=settings.api_key.get_secret_value(),  # type: ignore
                    # base_url=settings.model_server.__str__(),  # type: ignore
                    
                )
                result_text: str = result.choices[0].message.content  # type: ignore
                print(f"Fact-checking result: {result_text} \nfor prompt: {prompt} \nand search query: {search_query}")
                first_json = result_text.find("{")  # Ensure the response starts with a JSON object
                return result_text[first_json:]  # Return the JSON part of the response
            except Exception as e:
                print(f"Error during fact-checking: {e}")
                return 'Error: Fact check failed! Web Search is not available at the moment. Please mark this factoid with UNSURE instead.'
        else:
            print(f"Search failed: {search_result.err_value}")
            return 'Error: Fact check failed! Web Search is not available at the moment. Please mark this factoid with UNSURE instead.'

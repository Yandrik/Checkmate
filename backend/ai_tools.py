import urllib.parse
from langchain.chat_models import init_chat_model
from litellm import completion
from qwen_agent.tools.base import BaseTool, register_tool  # type: ignore
import json5
from result import Ok
from prompts import FACT_CHECK_AGENT_SYSTEM_PROMPT
from search import fetch_webpage, search, serper_search


from models import AiSettings
from trusted_sources import TrustedSourceType, build_url  
settings = AiSettings()  # type: ignore

@register_tool("fetch_webpage")
class FetchWebpage(BaseTool):
    """
    A tool that fetches the content of a webpage given its URL.
    It returns the text content of the page.
    """

    description = "A tool that fetches the content of a webpage given its URL. It returns the text content of the page."

    parameters = [
        {
            "name": "url",
            "type": "string",
            "description": "The URL of the webpage to fetch",
            "required": True,
        },
    ]

    def call(self, params: str, **kwargs) -> str:  # type: ignore
        """
        Call the fetch webpage tool with the provided parameters.
        :param params: JSON string containing the parameters for the tool.
        :return: Text content of the webpage.
        """
        data = json5.loads(params)
        if not isinstance(data, dict) or "url" not in data:
            raise ValueError("Invalid params: expected a dict with a 'url' key")
        
        url = data["url"]

        print(f"[> fetch_webpage tool >]: {url}")
        
        result = fetch_webpage(url=url)

        if isinstance(result, Ok):
            return f'=== CONTENT of Webpage "{url}" (first 2000 words) ===\n{' '.join(result.ok_value.split(' ')[:2000])}\n========'
        else:
            print(f"Fetch Webpage failed: {result.err_value}")
            return 'Error: Fetch Webpage failed! Please try a different webpage.'

@register_tool("web_search_2")
class WebSearch(BaseTool):
    """
    A tool that performs a web search.
    Give the tool a query, and it will return the top results.
    """

    description = "A tool that performs a web search. Give the tool a query, and it will return the top results."
    
    parameters = [
        {
            "name": "query",
            "type": "string",
            "description": "The search query to perform",
            "required": True,
        },
        {
            "name": "num_results",
            "type": "integer",
            "description": "Number of search results to return",
            "required": False,
        },
    ]

    def call(self, params: str, **kwargs) -> str:  # type: ignore
        """
        Call the web search tool with the provided parameters.
        :param params: JSON string containing the parameters for the tool.
        :return: JSON string with the search results.
        """
        data = json5.loads(params)
        if not isinstance(data, dict) or "query" not in data:
            raise ValueError("Invalid params: expected a dict with a 'query' key")
        
        query = urllib.parse.quote(data["query"])
        num_results = data.get("num_results", 10)
        
        search_result = serper_search(query=query, num_results=num_results)
        if isinstance(search_result, Ok):
            return search_result.ok_value
        else:
            print(f"Web Search failed: {search_result.err_value}")
            return 'Error: Web Search failed! Please try again later.'


@register_tool("trusted_web_search")
class TrustedWebSearch(BaseTool):
    """
    A tool that performs a web search on exclusively trusted sources.
    Give the tool a query, and it will return the top results.
    """

    description = "A tool that performs a web search on exclusively trusted sources. Give the tool a query, and it will return the top results."

    parameters = [
        {
            "name": "query",
            "type": "string",
            "description": "The search query to perform",
            "required": True,
        },
        {
            "name": "category",
            "type": "enum: GENERAL | POLITICS | SCIENCE | WORDS | GENERIC_UNTRUSTED",
            "description": "The category of trusted sources to search in. Choose from GENERAL, POLITICS, SCIENCE, WORDS, or GENERIC_UNTRUSTED.",
            "required": True,
        },
        {
            "name": "num_results",
            "type": "integer",
            "description": "Number of search results to return",
            "required": False,
        },
    ]

    def call(self, params: str, **kwargs) -> str:  # type: ignore
        """
        Call the web search tool with the provided parameters.
        :param params: JSON string containing the parameters for the tool.
        :return: JSON string with the search results.
        """
        data = json5.loads(params)
        if not isinstance(data, dict) or "query" not in data or "category" not in data:
            raise ValueError("Invalid params: expected a dict with a 'query' key")
        
        trusted_source_type: TrustedSourceType
        try:
            trusted_source_type = TrustedSourceType(data["category"].strip().lower().replace(' ', '_'))
        except ValueError as e:
            return f'Error: Invalid category. Choose from GENERAL, POLITICS, SCIENCE, WORDS, or GENERIC_UNTRUSTED. {str(e)}'
        
        
        query_params = build_url(trusted_source_type)  # type: ignore
        
        query = urllib.parse.quote(data["query"] + " " + query_params)
        num_results = data.get("num_results", 10)

        
        print(f"[> trusted_web_search tool >]: {trusted_source_type} | {query}")
        search_result = serper_search(query=query, num_results=num_results) # search(query=query, num_results=num_results)  # type: ignore
        
        # make search to string
        
        if isinstance(search_result, Ok):
            return search_result.ok_value
        else:
            return 'Error: Web Search failed! Please do not try to use this tool at the moment. It is not available.'
            

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
                    model= settings.litellm_model,
                    messages=[
                        {
                            "role": "system",
                            "content": FACT_CHECK_AGENT_SYSTEM_PROMPT,
                        },
                        {
                            "role": "user",
                            "content": f"Factoid: \"{prompt}\"\n\n=== Web Search (Query: \"{search_query}\")===\n{search_result.ok_value}\n\nPlease fact-check the above factoid based on the web search results. Provide a JSON response based on the Answer schema. /no_think",
                        },
                    ],
                    max_tokens=1000,
                    api_key=settings.litellm_api_key.get_secret_value(),  # type: ignore
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

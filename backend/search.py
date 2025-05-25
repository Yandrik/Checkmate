from duckduckgo_search import DDGS
from langchain_community.utilities import SearxSearchWrapper
from result import Err, Ok, Result

# SEARX_SEARCH_URL = "https://search.080609.xyz"  # Replace with your SearxNG instance URL

# searx_search = SearxSearchWrapper(searx_host=SEARX_SEARCH_URL)

def search(query: str, num_results: int = 10) -> Result[str, str]:
    """
    Perform a search using SearxNG and return the results.
    
    :param query: The search query.
    :param num_results: The number of results to return.
    :return: A list of search results.
    """
    try:
        # results = searx_search.run(query, engines=['qwant'], num_results=num_results)
        results_dicts = DDGS().text(query, max_results=num_results)
        results: str = "\n\n".join([result['title'] + " - " + result['href'] + "\n" + result["body"] for result in results_dicts]) 
        print(results)
        return Ok(results)
    except Exception as e:
        print(f"Error during search: {e}")
        return Err("Search failed due to an error.")
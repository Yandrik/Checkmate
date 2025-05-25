import os
from duckduckgo_search import DDGS
from langchain_community.utilities import SearxSearchWrapper
from result import Err, Ok, Result

# SEARX_SEARCH_URL = "https://search.080609.xyz"  # Replace with your SearxNG instance URL

# searx_search = SearxSearchWrapper(searx_host=SEARX_SEARCH_URL)

import requests  # type: ignore
import json

from urllib.request import urlopen
from bs4 import BeautifulSoup

def fetch_webpage(url: str) -> Result[str, str]:
    try:
        html = urlopen(url).read()
        soup = BeautifulSoup(html, features="html.parser")

        # kill all script and style elements
        for script in soup(["script", "style"]):
            script.extract()    # rip it out

        # get text
        text = soup.get_text()

        # break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return Ok(text.strip())
    except Exception as e:
        error_message = f"Failed to fetch webpage: {e}"
        print(error_message)
        return Err(error_message)


def serper_req(query: str, num_results: int = 10, api_key: str | None = None) -> Result[dict, str]:
    """
    Makes a request to the Serper API.

    :param api_key: The Serper API key.
    :param query: The search query.
    :param num_results: The number of results to request (Note: Serper API might not directly use this,
                        it typically returns a page of results. This parameter is kept for consistency
                        but might not affect the number of results from Serper's basic endpoint).
    :return: A Result object containing the JSON response as a dict if successful, or an error message string.
    """
    url = "https://google.serper.dev/search"
    payload = json.dumps({
        "q": query,
        # Serper API documentation should be checked for how to control num_results.
        # For now, we send the query. The API might have a default or other ways to control result count.
        # "num": num_results # Example, if Serper supported it directly in the payload
        "num": num_results
    })
    headers = {
        'X-API-KEY': api_key if api_key else os.getenv("SERPER_API_KEY"),  # Use the provided API key or environment variable
        'Content-Type': 'application/json'
    }

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        return Ok(response.json())
    except requests.exceptions.HTTPError as http_err:
        error_message = f"Serper API HTTP error: {http_err} - Response: {response.text}"
        print(error_message)
        return Err(error_message)
    except requests.exceptions.RequestException as req_err:
        error_message = f"Serper API request failed: {req_err}"
        print(error_message)
        return Err(error_message)
    except json.JSONDecodeError as json_err:
        error_message = f"Failed to decode Serper API JSON response: {json_err} - Response: {response.text}"
        print(error_message)
        return Err(error_message)
    except Exception as e:
        error_message = f"An unexpected error occurred during Serper API request: {e}"
        print(error_message)
        return Err(error_message)


def serper_llm_search(query: str, num_results: int = 10, api_key: str | None = None) -> Result[str, str]:
    """
    Perform a search using Serper and return the results as a formatted string.
    
    :param query: The search query.
    :param num_results: The number of results to return.
    :param api_key: Optional Serper API key.
    :return: A formatted string of search results or an error message.
    """
    result = serper_req(query, num_results, api_key)
    
    if isinstance(result, Ok):
        results = result.ok_value.get('organic', [])
        formatted_results = "\n\n".join([f"{res['title']} ({res['link']})\n{res.get('snippet', '')}" for res in results])
        return Ok(formatted_results)
    else:
        return Err(result.err_value)

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
        results: str = "\n\n".join([result['title'] + " (" + result['href'] + ")\n" + result["body"] for result in results_dicts]) 
        print(results)
        return Ok(results)
    except Exception as e:
        print(f"Error during search: {e}")
        return Err("Search failed due to an error.")

def serper_search(query: str, num_results: int = 10) -> Result[str, str]:
    """
    Perform a search using Serper and return the results.
    
    :param query: The search query.
    :param num_results: The number of results to return.
    :return: A list of search results.
    """
    try:
        results = serper_llm_search(query, num_results=num_results)
        if results:
            return results
        else:
            return Err("No results found or an error occurred during the Serper search.")
    except Exception as e:
        print(f"Error during Serper search: {e}")
        return Err("Serper search failed due to an error.")



if __name__ == "__main__":
    # Example usage
    query = "Python programming language"
    num_results = 5

    print("Fetching webpage...")
    webpage_result = fetch_webpage("https://www.python.org")
    if isinstance(webpage_result, Ok):
        print("Webpage fetched successfully.")
        print(webpage_result.ok_value[:2000])  # Print first 2000 characters
    else:
        print(f"Error fetching webpage: {webpage_result.err_value}")

    print("\nPerforming search...")
    search_result = serper_search(query, num_results)
    if isinstance(search_result, Ok):
        print("Search results:")
        print(search_result.ok_value)
    else:
        print(f"Error during search: {search_result.err_value}")
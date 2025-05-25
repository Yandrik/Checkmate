import json
import re
from typing import Optional, Dict, Any, Tuple


def method1_find_last_brace(text: str) -> Optional[Dict[Any, Any]]:
    """
    Method 1: Find the last occurrence of '{' and try to parse from there
    Simple and often effective for JSON at the end of documents
    """
    # Find the last occurrence of '{'
    last_brace_index = text.rfind('{')
    
    if last_brace_index == -1:
        return None
    
    # Extract potential JSON from last brace to end
    potential_json = text[last_brace_index:].strip()
    
    try:
        return json.loads(potential_json)
    except json.JSONDecodeError:
        return None


def method2_regex_pattern(text: str) -> Optional[Dict[Any, Any]]:
    """
    Method 2: Use regex to find JSON-like patterns
    More sophisticated pattern matching
    """
    # Pattern to match JSON objects (simplified)
    # This looks for { ... } patterns that might be JSON
    json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}(?:\s*$)'
    
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    # Try each match from the end (most likely to be the target JSON)
    for match in reversed(matches):
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue
    
    return None


def method3_bracket_counting(text: str) -> Optional[Dict[Any, Any]]:
    """
    Method 3: Use bracket counting to find complete JSON objects
    Most robust for complex nested structures
    """
    # Start from the end and work backwards
    brace_count = 0
    start_index = -1
    
    # Go through text backwards
    for i in range(len(text) - 1, -1, -1):
        char = text[i]
        
        if char == '}':
            brace_count += 1
            if start_index == -1:
                start_index = i
        elif char == '{':
            brace_count -= 1
            
            # If we've balanced all braces, we found a complete JSON object
            if brace_count == 0 and start_index != -1:
                potential_json = text[i:start_index + 1].strip()
                try:
                    return json.loads(potential_json)
                except json.JSONDecodeError:
                    # Continue looking for other JSON objects
                    brace_count = 0
                    start_index = -1
    
    return None


def method4_lines_from_end(text: str, max_lines: int = 50) -> Optional[Dict[Any, Any]]:
    """
    Method 4: Check last N lines for JSON
    Good when you know JSON is in the last few lines
    """
    lines = text.strip().split('\n')
    
    # Try progressively more lines from the end
    for num_lines in range(1, min(max_lines + 1, len(lines) + 1)):
        candidate_text = '\n'.join(lines[-num_lines:])
        
        try:
            return json.loads(candidate_text.strip())
        except json.JSONDecodeError:
            continue
    
    return None


def method5_split_and_try(text: str) -> Optional[Dict[Any, Any]]:
    """
    Method 5: Split by common delimiters and try each part
    Useful when JSON is separated by specific patterns
    """
    # Common separators that might appear before JSON
    separators = ['\n\n', '}\n', '}\r\n', '\n{', '```']
    
    parts = [text]  # Start with the whole text
    
    # Split by each separator
    for sep in separators:
        new_parts = []
        for part in parts:
            new_parts.extend(part.split(sep))
        parts = new_parts
    
    # Try each part (starting from the end)
    for part in reversed(parts):
        cleaned_part = part.strip()
        if cleaned_part.startswith('{') and cleaned_part.endswith('}'):
            try:
                return json.loads(cleaned_part)
            except json.JSONDecodeError:
                continue
    
    return None


def extract_json_from_end(text: str) -> Tuple[Optional[Dict[Any, Any]], str]:
    """
    Main function that tries multiple methods to extract JSON
    Returns (json_data, method_used)
    """
    methods = [
        (method1_find_last_brace, "Last brace method"),
        (method3_bracket_counting, "Bracket counting method"),
        (method4_lines_from_end, "Lines from end method"),
        (method2_regex_pattern, "Regex pattern method"),
        (method5_split_and_try, "Split and try method")
    ]
    
    for method_func, method_name in methods:
        try:
            result = method_func(text)  # type: ignore
            if result is not None:
                return result, method_name
        except Exception as e:
            print(f"Error in {method_name}: {e}")
            continue
    
    return None, "No method succeeded"


# Example usage with your document
def test_with_sample_document():  # type: ignore
    """Test with the sample document content"""
    
    sample_text = '''A Grassroots revolution is coming, and the Legacy Media won't report on it.; isAd: True; platform: twitter
INFO - 2025-05-25 03:50:40,210 - httpx - _client - HTTP Request: POST https://openrouter.ai/api/v1/chat/completions "HTTP/1.1 200 OK"
INFO - 2025-05-25 03:50:48,083 - httpx - _client - HTTP Request: POST https://openrouter.ai/api/v1/chat/completions "HTTP/1.1 200 OK"

{
  "factoids": [],
  "check_result": "The statement is vague and subjective, referencing 'scenes like this' without specific details or evidence. The mention of a 'Grassroots revolution' and the credibility of not being reported by 'Legacy Media' cannot be objectively verified with the available information. The user appears to be a social media presence, and the context is speculative or opinion-based.",
  "verdict": "UNSURE",
  "score": 30,
  "sources": [
    {
      "name": "Inevitable West - X",
      "link": "None provided"
    },
    {
      "name": "Grassroots Music Venues Report (PDF) - Music Venue Trust",
      "link": "None provided"
    }
  ]
}'''
    
    json_data, method_used = extract_json_from_end(sample_text)
    
    if json_data:
        print(f"✅ Successfully extracted JSON using: {method_used}")
        print(f"Verdict: {json_data.get('verdict')}")
        print(f"Score: {json_data.get('score')}")
        print(f"Number of sources: {len(json_data.get('sources', []))}")
        return json_data
    else:
        print(f"❌ Failed to extract JSON. Last method tried: {method_used}")
        return None


# Quick utility function for your specific use case
def get_json_from_document(file_path: str) -> Optional[Dict[Any, Any]]:
    """
    Simple function to read a file and extract JSON from the end
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        json_data, method_used = extract_json_from_end(content)
        if json_data:
            print(f"Extracted JSON using: {method_used}")
        
        return json_data
    
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None


if __name__ == "__main__":
    # Test with the sample document
    test_with_sample_document()
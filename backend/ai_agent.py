import os
import logging
from typing import Any, Dict, List
import json5
from qwen_agent.agent import Message
from qwen_agent.agents import Assistant #type: ignore
from qwen_agent.utils.output_beautify import typewriter_print #type: ignore
import ai_tools

from json_stuff import extract_json_from_end, get_json_from_document
from models import (
    AiSettings,
    Factoid,
    FactCheckResult,
    SocialMediaDetailsRequest,
    AllMediaRequest,
    MediaDetailsRequest,
    FactCheckDetailsRequest)
from prompts import DISPATCHER_SYSTEM_PROMPT, SIMPLE_FACTCHECKER_SYSTEM_PROMPT

class Agent:
    def __init__(self) -> None:
        settings = AiSettings() # type: ignore
        self.logger = logging.getLogger(__name__)
        llm_cfg = {
            'api_key': settings.api_key.get_secret_value(), 
            'model': settings.model,
            'model_server': str(settings.model_server),
            'model_type': settings.model_type,
        }
        # system_instruction = DISPATCHER_SYSTEM_PROMPT
        system_instruction = SIMPLE_FACTCHECKER_SYSTEM_PROMPT
        tools = ['trusted_web_search', 'fetch_webpage']

        dispatcher_system_instruction = DISPATCHER_SYSTEM_PROMPT
        dispatcher_tools = ['fact_check']
        

        # tools = ['fact_check']
        # tools: list[str | dict | BaseTool] = [{
        # "mcpServers": {
        #     "websearch" : {
        #         "command": "uvx",
        #         "args": [
        #             "duckduckgo-mcp-server",
        #             ]
        #         }
        #     }
        # }]
        # ['fact_checker']  # `code_interpreter` is a built-in tool for executing code.
        self.bot = Assistant(llm=llm_cfg,
                        system_message=system_instruction,
                        function_list=tools)  # type: ignore

        self.dispatcher_bot = Assistant(llm=llm_cfg,
                        system_message=dispatcher_system_instruction,
                        function_list=dispatcher_tools)  # type: ignore


    def parse_ai_response(self, ai_response) -> FactCheckResult: #type: ignore
        # ai_response =' '.join(ai_response.replace("\\n","").strip().split())
        # Truncate everything before the first occurrence of '\n{\n'
        # ai_response_json = json5.loads(ai_response)
        # If the response is a list, take the first element (as in the provided example)
        ai_response_json, method= extract_json_from_end(ai_response)
        print(f'read json with method {method}')
        if isinstance(ai_response_json, list):
            ai_response_json = ai_response_json[0]
        return FactCheckResult(**ai_response_json) #type: ignore
    
    
    def factcheck_plain_text(self, text: str) -> FactCheckResult:
        """
        Fact-check a plain text using the AI agent.
        :param text: Text to fact-check.
        :return: FactCheckResult containing the verdict and sources.
        """
        messages = [
            {'role': 'user', 'content': f'Fact-check this text: {text}'}
        ]
        response = self.ai_run(messages)
        return response
    
    def factcheck_whole_page(self, search_req: FactCheckDetailsRequest) -> FactCheckResult:
        """
        Fact-check a website using the AI agent.
        :param url: URL of the website to fact-check.
        :param text: Text content from the website.
        :return: FactCheckResult containing the verdict and sources.
        """
        messages = [
            {'role': 'user', 'content': f'Fact-check this website: {search_req.url} with content: {search_req.content} /no_think'}
        ]
        response = self.ai_run(messages)
        return response
    
    def factcheck_social_media(self, social_med: SocialMediaDetailsRequest) -> FactCheckResult:
        messages = [
            {'role': 'user', 'content': f'Fact-check this comment on a social media platform from user: {social_med.username} with content: {social_med.content}. /no_think'}
        ]
        response = self.ai_run(messages)
        return response
    
    def factcheck_all_media(self, all_media: AllMediaRequest, media_det: MediaDetailsRequest) -> FactCheckResult:
        if all_media.images is None and all_media.videos is None:
            self.logger.warning('No media to fact-check')
            raise ValueError('No media to fact-check')
        elif all_media.images is not None and len(all_media.images) > 0:
            self.logger.error('Not implemented yet') #TODO: Implement image fact-checking
            raise NotImplementedError('Image fact-checking is not implemented yet')
        elif all_media.videos is not None and len(all_media.videos) > 0:
            return self.factcheck_media_details(media_det)
        response = self.ai_run(messages)
        return response

    def factcheck_media_details(self, media_details: MediaDetailsRequest) -> FactCheckResult:
        messages = [
            {'role': 'user', 'content': f'Fact-check this youtube video from this channel: {media_details.channel}. The relevant information you should research to is here: {media_details.transcription_close_to_timestamp}, but also put it into the broad context: {media_details.transcription_with_more_context}. The video ID is {media_details.videoId} and the URL is {media_details.url}. Also check the credibility of the channel. /no_think'}
        ]
        response = self.ai_run(messages)
        return response
    
    def factcheck_factoids(self, factoids: List[Factoid]) -> FactCheckResult: #TODO: Implement fact-checking for factoids
        """
        Fact-check up to 8 factoids in a single prompt.
        :param factoids: List of Factoid objects to fact-check (max 8).
        :return: FactCheckResult containing the verdicts and sources for each factoid.
        """
        raise NotImplementedError("Fact-checking for factoids is not implemented yet.")
        if not factoids or len(factoids) == 0:
            raise ValueError("No factoids provided for fact-checking.")
        if len(factoids) > 8:
            raise ValueError("A maximum of 8 factoids can be fact-checked at once.")
        
        factoid_texts = [f"{i+1}. {factoid.text}" for i, factoid in enumerate(factoids)]
        joined_factoids = "\n".join(factoid_texts)
        prompt = (
            f"Fact-check the following {len(factoids)} factoids. For each, return a JSON object with the fields: 'factoid', 'verdict', 'sources', and 'explanation'. "
            f"Respond as a list of {len(factoids)} such objects. Here are the factoids to check:\n{joined_factoids}"
        )
        messages = [
            {'role': 'user', 'content': prompt}
        ]
        response = self.ai_run(messages)
        return response
    
    def ai_run(self, messages: List[Dict], thorough: bool = False) -> FactCheckResult:
        """
        Run the agent with the given messages.
        :param messages: List of messages to process.
        :return: Generator yielding responses from the agent.
        """
        response_json: Any | None = None
        *_, response_list = self.bot.run(messages=messages)  if not thorough else  self.dispatcher_bot.run(messages=messages)  # type:ignore
        response_json = response_list[-1].get('content')
        if response_json is None:
            self.logger.error("No valid response from the AI agent.")
            raise ValueError("No response from the AI agent.")
        return self.parse_ai_response(response_json) #type: ignore

if __name__ == "__main__":
    # Example usage
    agent = Agent()
    messages = []
    query = 'Watermelons are vegetables'
    messages.append({'role': 'user', 'content': query})

    agent.ai_run(messages )


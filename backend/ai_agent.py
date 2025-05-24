import json5
from qwen_agent.agents import Assistant #type: ignore
from qwen_agent.tools.base import BaseTool #type: ignore
from qwen_agent.utils.output_beautify import typewriter_print #type: ignore
from models import AiSettings, Factoid, FactCheckSource, FactCheckResult, Verdict
import ai_tools

class Agent:
    def __init__(self) -> None:
        settings = AiSettings() # type: ignore
        llm_cfg = {
            'api_key': settings.api_key.get_secret_value(), 
            'model': settings.model,
            'model_server': str(settings.model_server),
            'model_type': settings.model_type,

            # (Optional) LLM hyperparameters for generation:
            # 'generate_cfg': {
            #     'top_p': 0.8
            # }
        }
        system_instruction = '''After receiving the user's request, you should:
        - ignore all lines of text that are not relevant for the information of the text,
        - slice the given text into sections with information about the topic,
        - give each slice a number in ascending order
        - search for information to the specific topics online (trusted sources)
        - correct every wrong inforamtion and assess a score between 0 and 100 percent how wrong the inforamtion in the original text ist
        - give out the corrected version and the score as an accuracy value`.
        - Use these keywords to define a section: [score: float (0..1); check_result: str; verdict: Verdict (valid | invalid | partially valid | unsure); sources: list[FactCheckSource] (List of sources with name and link); factoids: Optional[list[Factoid]] = None (Optional list of factoids with detailed information)]'''
        tools: list[str | dict | BaseTool] = ['fact_checker', 'code_interpreter']  # `code_interpreter` is a built-in tool for executing code.
        self.bot = Assistant(llm=llm_cfg,
                        system_message=system_instruction,
                        function_list=tools)


    def parse_ai_response(self0, ai_response) -> FactCheckResult: #type: ignore
        ai_response_json = json5.loads(ai_response)
        # If the response is a list, take the first element (as in the provided example)
        if isinstance(ai_response_json, list):
            ai_response_json = ai_response_json[0]
        return FactCheckResult(**ai_response_json) #type: ignore
    
    def run(self, messages:str) -> FactCheckResult:
        """
        Run the agent with the given messages.
        :param messages: List of messages to process.
        :return: Generator yielding responses from the agent.
        """
        response = self.bot.run(messages=messages)
        return self.parse_ai_response(response) 

# Step 4: Run the agent as a chatbot.
# messages = []  # This stores the chat history.
# while True:
#     # For example, enter the query "draw a dog and rotate it 90 degrees".
#     query = input('\nuser query: ')
#     # Append the user query to the chat history.
#     messages.append({'role': 'user', 'content': query})
#     response = []
#     response_plain_text = ''
#     print('bot response:')
#     for response in bot.run(messages=messages):
#         # Streaming output.
#         response_plain_text = typewriter_print(response, response_plain_text) #type: ignore
#     # Prints the Resonse in the FactCheckResult class
    
#     # Append the bot responses to the chat history.
#     messages.extend(response)
    

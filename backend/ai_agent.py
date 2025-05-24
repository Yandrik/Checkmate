from qwen_agent.agents import Assistant #type: ignore
from qwen_agent.tools.base import BaseTool #type: ignore
from qwen_agent.utils.output_beautify import typewriter_print #type: ignore
from models import AiSettings, Factoid, FactCheckSource, FactCheckResult, Verdict
import ai_tools

class Agent:
    def __init__(self) -> None:
        settings = AiSettings() # type: ignore

        # Step 2: Configure the LLM you are using.
        llm_cfg = {
            # Use the model service provided by DashScope:
            # 'model': 'qwen-max-latest',
            # 'model_type': 'qwen_dashscope',
            'api_key': settings.api_key.get_secret_value(), 
            'model': settings.model,
            'model_server': settings.model_server,
            'model_type': settings.model_type,
            
            # 'api_key': 'YOUR_DASHSCOPE_API_KEY',
            # It will use the `DASHSCOPE_API_KEY' environment variable if 'api_key' is not set here.

            # Use a model service compatible with the OpenAI API, such as vLLM or Ollama:
            # 'model': 'Qwen2.5-7B-Instruct',
            # 'model_server': 'http://localhost:8000/v1',  # base_url, also known as api_base
            # 'api_key': 'EMPTY',

            # (Optional) LLM hyperparameters for generation:
            # 'generate_cfg': {
            #     'top_p': 0.8
            # }
        }

        #
        # ENTER PROMPT TO CREATE THE CORRECT BEHAVIOR OF THE AGENT HERE BELOW
        #

        # Step 3: Create an agent. Here we use the `Assistant` agent as an example, which is capable of using tools and reading files.
        system_instruction = '''After receiving the user's request, you should:
        - ignore all lines of text that are not relevant for the information of the text,
        - slice the given text into sections with information about the topic,
        - give each slice a number in ascending order
        - search for information to the specific topics online (trusted sources)
        - correct every wrong inforamtion and assess a score between 0 and 100 percent how wrong the inforamtion in the original text ist
        - give out the corrected version and the score as an accuracy value`.
        - Use these keywords to define a section: [score: float (0..1); check_result: str; verdict: Verdict (valid | invalid | partially valid | unsure); sources: list[FactCheckSource] (List of sources with name and link); factoids: Optional[list[Factoid]] = None (Optional list of factoids with detailed information)]'''
        tools: list[str | dict | BaseTool] = ['fact_checker', 'code_interpreter']  # `code_interpreter` is a built-in tool for executing code.
        #files = ['aufgabenstellung.pdf']  # Give the bot a PDF file to read.
        self.bot = Assistant(llm=llm_cfg,
                        system_message=system_instruction,
                        function_list=tools)


    def parse_ai_response(self,ai_response) -> FactCheckResult: #type: ignore
        sources = [FactCheckSource(**src) for src in ai_response.get("sources", [])]
        factoids = None
        if "factoids" in ai_response and ai_response["factoids"] is not None:
            factoids = [
                Factoid(
                    start=f["start"],
                    end=f["end"],
                    text=f["text"],
                    verdict=f["verdict"],
                    check_result=f["check_result"],
                    sources=[FactCheckSource(**src) for src in f.get("sources", [])]
                )
                for f in ai_response["factoids"]
            ]
        verdict = Verdict(ai_response["verdict"])
        return FactCheckResult(
            score=ai_response["score"],
            check_result=ai_response["check_result"],
            verdict=verdict,
            sources=sources,
            factoids=factoids
    )
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
    
import logging
from litestar import Router, post, get, Controller
from pydantic import HttpUrl
from models import (
  FactCheckResult,
  FactCheckDetailsRequest,
  SocialMediaDetailsRequest,
  MediaDetailsRequest)
from ai_agent import Agent

agent = Agent()

class FactcheckController(Controller):
  path = "/factcheck"
  
  def __init__(self,owner:Router) -> None:
    super().__init__(owner=owner)
    self.logger = logging.getLogger(__name__)

  @post()
  async def handle_fact_check(self, data: FactCheckDetailsRequest) -> FactCheckResult:
    try:
      HttpUrl(data.url) # type: ignore[arg-type]
      self.logger.info(f"title: {data.title}; url: {data.url};")
      self.logger.debug(f"Content: {data.content[:50]}...")  # Log only the first 50 characters for brevity
      return agent.factcheck_whole_page(data)
    except Exception as e:
      self.logger.error(f"Error processing fact check: {e}")
      raise e

  @post("/text")
  async def handle_fact_check_text(self, data: str) -> FactCheckResult:
    try:
      self.logger.info(f"Received text for fact check: {data[:50]}...")
      return agent.factcheck_plain_text(data)
    except Exception as e:
      self.logger.error(f"Error processing text fact check: {e}")
      raise e  

  @post("/socialmedia")
  async def handle_fact_check_socialmedia(self, data: SocialMediaDetailsRequest) -> FactCheckResult:
    try:
      self.logger.info(f"username: {data.username}; displayName: {data.displayName}; content: {data.content}; isAd: {data.isAd}; platform: {data.platform}")
      return agent.factcheck_social_media(data)
    except Exception as e:
      self.logger.error(f"Error processing social media fact check: {e}")
      raise e
  
  @post("/media")
  async def handle_fact_check_media(self,data: MediaDetailsRequest) -> FactCheckResult:
    try:
      self.logger.info(f"Received input: {data.title} -> {data.channel}")
      return agent.factcheck_media_details(data)
    except Exception as e:
      self.logger.error(f"Error processing media fact check: {e}")
      raise e

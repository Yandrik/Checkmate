import logging
from litestar import Router, post, get, Controller
from pydantic import HttpUrl
from models import (
  FactCheckResult,
  FactCheckSource,
  FactCheckDetailsRequest,
  SocialMediaDetailsRequest,
  Verdict,
  MediaDetailsRequest,
  MediaCommentDetailsRequest)
import asyncio
from ai_agent import Agent

agent = Agent()

class FactcheckController(Controller):
  path = "/factcheck"
  
  def __init__(self,owner:Router) -> None:
    super().__init__(owner=owner)
    self.logger = logging.getLogger(__name__)

  @post()
  async def handle_fact_check(self, data: FactCheckDetailsRequest) -> FactCheckResult:
    HttpUrl(data.url) # type: ignore[arg-type]
    self.logger.info(f"Received input: {data.title} -> {data.url}")
    return await asyncio.to_thread(agent.factcheck_whole_page,data) 
    

  @post("/text")
  async def handle_fact_check_text(self, data: str) -> FactCheckResult:
    self.logger.info(f"Received text input: {data}")
    raise NotImplementedError("TODO: Implement text fact check")
    # return await asyncio.to_thread(agent.factcheck_text, data)

  @post("/socialmedia")
  async def handle_fact_check_socialmedia(self, data: SocialMediaDetailsRequest) -> FactCheckResult:
    # HttpUrl(data.url) # type: ignore[arg-type]
    self.logger.info(f"Received input: {data.username} -> {data.displayName}")
    return await asyncio.to_thread(agent.factcheck_social_media, data)
  
  @post("/media")
  async def handle_fact_check_media(self,data: MediaDetailsRequest) -> FactCheckResult:
    self.logger.info(f"Received input: {data.title} -> {data.url}")
    return await asyncio.to_thread(agent.factcheck_media_details, data)
  
  @post("/media/comment")
  async def handle_fact_check_media_comment(self, data: MediaCommentDetailsRequest) -> FactCheckResult:
    self.logger.info(f"Received input: {data.author} -> {data.channelUrl}")
    return await asyncio.to_thread(agent.factcheck_media_comment, data)
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

class FactcheckController(Controller):
  path = "/factcheck"
  
  def __init__(self,owner:Router) -> None:
    super().__init__(owner=owner)
    self.logger = logging.getLogger(__name__)

  @post()
  async def handle_fact_check(self, data: FactCheckDetailsRequest) -> FactCheckResult:
    HttpUrl(data.url) # type: ignore[arg-type]
    self.logger.info(f"Received input: {data.title} -> {data.url}")
    await asyncio.sleep(7)
    return FactCheckResult(
      score=0.5,
      check_result=f"echo: {data.content}",
      verdict=Verdict.UNSURE,
      sources=[
        FactCheckSource(
          name=f"Echo Source: {data.title}",
          link=data.url),
        FactCheckSource(
          name="Dummy Source",
          link="https://example.com/dummy_source")
      ])

  @post("/text")
  async def handle_fact_check_text(self, data: str) -> FactCheckResult:
    self.logger.info(f"Received text input: {data}")
    await asyncio.sleep(7)
    return FactCheckResult(
      score=0.5,
      check_result=f"echo: {data}",
      verdict=Verdict.UNSURE,
      sources=[
        FactCheckSource(
          name="Echo Text Source",
          link="https://example.com/echo_text_source")
      ])

  @post("/socialmedia")
  async def handle_fact_check_socialmedia(self, data: SocialMediaDetailsRequest) -> FactCheckResult:
    # HttpUrl(data.url) # type: ignore[arg-type]
    self.logger.info(f"Received input: {data.username} -> {data.displayName}")
    return FactCheckResult(
      score=0.5,
      check_result=f"echo: {data.content}",
      verdict=Verdict.UNSURE,sources=[])
  
  @post("/media")
  async def handle_fact_check_media(self,data: MediaDetailsRequest) -> FactCheckResult:
    raise NotImplementedError("TODO: Implement media fact check")
  
  @post("/media/comment")
  async def handle_fact_check_media_comment(self, data: MediaCommentDetailsRequest) -> FactCheckResult:
    raise NotImplementedError("TODO: Implement media comment fact check")
from dataclasses import dataclass
import logging
from litestar import Litestar, post, get, Controller
import hypercorn
import hypercorn.trio
from pydantic import HttpUrl
import trio_asyncio # type: ignore[import]
from models import (FactCheckResult,
                    FactCheckSource,
                    SearchRequest,
                    SocialMediaDetailsRequest,
                    Verdict)
import asyncio

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger()

class FactcheckController(Controller):
  path = "/factcheck"

  @post()
  async def handle_fact_check(self, data: SearchRequest) -> FactCheckResult:
    HttpUrl(data.url) # type: ignore[arg-type]
    logger.info(f"Received input: {data.title} -> {data.url}")
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

  @post("/socialmedia")
  async def handle_fact_check_socialmedia(self, data: SocialMediaDetailsRequest) -> FactCheckResult:
    # HttpUrl(data.url) # type: ignore[arg-type]
    logger.info(f"Received input: {data.username} -> {data.displayName}")
    return FactCheckResult(
      score=0.5,
      check_result=f"echo: {data.content}",
      verdict=Verdict.UNSURE,sources=[])

@get("/")
async def handle_get() -> object:
  logger.info("Received GET request")
  return {"message": "health check"}

app = Litestar(
  route_handlers=[
    FactcheckController,
    handle_get,
  ])

async def main() -> None:
  logger.info("Starting the Litestar app...")
  config = hypercorn.Config()
  config.worker_class = "trio"
  config.use_reloader = True
  await hypercorn.trio.serve(app, config)  # type: ignore[arg-type]
  logger.info("Hypercorn Serve completed, shutting down...")

if __name__ == "__main__":
  trio_asyncio.run(main)

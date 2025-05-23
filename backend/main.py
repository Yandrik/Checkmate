from litestar import Litestar, post, get
import hypercorn
import hypercorn.trio
import logging
import trio_asyncio # type: ignore[import]
from pydantic import BaseModel, HttpUrl

logging.basicConfig(level=logging.INFO,)
logger = logging.getLogger(__name__)

class SearchRequest(BaseModel):
  title: str
  url: HttpUrl
  content: str
  html: str 
class Response(BaseModel):
  score: float
@post("/factcheck")
async def handle_fact_check(input: SearchRequest) -> Response:
  logger.info(f"Received input: {input.model_json_schema()}")
  return Response(score=0.56)
@get("/")
async def handle_get() -> object:
  logger.info("Received GET request")
  return {"message": "health check"}

app = Litestar(
  route_handlers=[
    handle_fact_check,
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
import ai_agent

# ai_agent.main()

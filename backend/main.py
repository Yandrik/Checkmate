import logging
from litestar import Litestar, get,Controller
import asyncio # type: ignore[import]
import uvicorn
from controller import FactcheckController

logging.basicConfig(level=logging.DEBUG)

logger = logging.getLogger()

class DefaultControler(Controller):
  path="/"
  @get()
  async def health(self) -> str:
    return "up"

app = Litestar(
  route_handlers=[
    FactcheckController,
    DefaultControler
  ])

async def main() -> None:
  logger.info("Starting the Litestar app...")
  server_config = uvicorn.Config(
    app=app,
    host="0.0.0.0")
  server = uvicorn.Server(config=server_config)
  await server.serve()
  logger.info("Hypercorn Serve completed, shutting down...")

if __name__ == "__main__":
  asyncio.run(main())

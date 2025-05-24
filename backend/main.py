import logging
from litestar import Litestar, get,Controller
import hypercorn
import hypercorn.trio
import trio_asyncio # type: ignore[import]
from controller import FactcheckController

logging.basicConfig(level=logging.INFO)

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
  config = hypercorn.Config()
  config.bind = ["0.0.0.0:8000"]
  config.worker_class = "trio"
  config.use_reloader = True
  await hypercorn.trio.serve(app, config)  # type: ignore[arg-type]
  logger.info("Hypercorn Serve completed, shutting down...")

if __name__ == "__main__":
  trio_asyncio.run(main)

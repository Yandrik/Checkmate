import logging
from litestar import Litestar
import hypercorn
import hypercorn.trio
import trio_asyncio # type: ignore[import]
from controller import FactcheckController

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger()

app = Litestar(
  route_handlers=[
    FactcheckController,
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

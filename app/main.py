from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.database import database, connect_with_retry
from fastapi.staticfiles import StaticFiles
import logging
import time
import asyncio
from app.models import prices

VERSION = "0.1.0"

app = FastAPI(title="XLL Data Service", version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

logging.basicConfig(filename='app.log', level=logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logging.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response

@app.get("/")
async def root():
    return {"message": "Welcome to XLL Data Service. Visit /static/index.html for the dashboard.", "version": VERSION}

app.include_router(endpoints.router)

async def fetch_prices_with_retry(max_retries=5, delay=60):
    for _ in range(max_retries):
        try:
            from app.price_fetcher import main as fetch_prices
            await fetch_prices()
            return
        except Exception as e:
            logging.error(f"Error fetching prices: {str(e)}")
            await asyncio.sleep(delay)
    logging.critical("Failed to fetch prices after maximum retries. Using last available data.")

@app.on_event("startup")
async def startup():
    from app.database import init_db, connect_with_retry
    try:
        init_db()
        await connect_with_retry()
        asyncio.create_task(fetch_prices_with_retry())
    except Exception as e:
        logging.error(f"Startup failed: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.include_router(endpoints.router)

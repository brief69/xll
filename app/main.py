from fastapi import FastAPI
from app.api import endpoints
from app.database import database

app = FastAPI(title="XLL Data Service")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.include_router(endpoints.router)
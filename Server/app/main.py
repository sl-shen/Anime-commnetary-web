from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import users, media, reviews, bangumi
from dotenv import load_dotenv
import uvicorn
import logging

logging.basicConfig(level=logging.DEBUG)

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "https://kksk.yukinolov.com",
    "http://localhost:5173",
    "localhost:5173",
    "http://localhost",
    "http://localhost:80",
    "http://localhost:8080",
    "http://192.168.1.240:7979",
    "http://192.168.1.240:8000",
    "http://127.0.0.1:8000"
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users.router)
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(bangumi.router, prefix="/bangumi", tags=["bangumi"])
app.include_router(media.router, prefix="/media", tags=["media"])

@app.get("/")
async def root():
    return {"message": "Welcome to Anime Review API"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
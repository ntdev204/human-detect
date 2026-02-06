"""
Human Detection Server - FastAPI Application
Real-time human detection using YOLOv8
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import detection
from services.detector import DetectorService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    # Load model on startup
    detector = DetectorService()
    app.state.detector = detector
    yield
    # Cleanup on shutdown
    del app.state.detector


app = FastAPI(
    title="Human Detection API",
    description="Real-time human detection using YOLOv8",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for Next.js client
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://human-detect.ntdev.id.vn",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detection.router, prefix="/api", tags=["Detection"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": hasattr(app.state, "detector")}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

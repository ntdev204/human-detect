"""
Detection API Router
REST and WebSocket endpoints for human detection
"""

import base64
import json
from typing import Optional

from fastapi import APIRouter, File, UploadFile, WebSocket, WebSocketDisconnect, Request, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel


router = APIRouter()


class DetectionRequest(BaseModel):
    """Request model for base64 image detection"""
    image: str  # Base64 encoded image
    confidence: Optional[float] = 0.5


@router.post("/detect")
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    confidence: float = Query(0.5, ge=0.1, le=1.0)
):
    """
    Detect humans in uploaded image
    
    - **file**: Image file (JPEG, PNG)
    - **confidence**: Detection confidence threshold (0.1-1.0)
    """
    # Read image bytes
    contents = await file.read()
    
    # Get detector from app state
    detector = request.app.state.detector
    
    # Run detection
    result = detector.detect_from_bytes(contents, confidence)
    
    return JSONResponse(content=result)


@router.post("/detect/base64")
async def detect_base64(request: Request, body: DetectionRequest):
    """
    Detect humans in base64 encoded image
    
    - **image**: Base64 encoded image string
    - **confidence**: Detection confidence threshold
    """
    detector = request.app.state.detector
    result = detector.detect_from_base64(body.image, body.confidence)
    return JSONResponse(content=result)


@router.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    """
    Real-time human detection via WebSocket
    
    Send: {"image": "<base64_image>", "confidence": 0.5}
    Receive: {"detections": [...], "count": N, "has_person": bool}
    """
    await websocket.accept()
    detector = websocket.app.state.detector
    
    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Extract image and confidence
            image_b64 = message.get("image", "")
            confidence = message.get("confidence", 0.5)
            
            if not image_b64:
                await websocket.send_json({"error": "No image provided"})
                continue
            
            # Remove data URL prefix if present
            if "base64," in image_b64:
                image_b64 = image_b64.split("base64,")[1]
            
            # Run detection
            result = detector.detect_from_base64(image_b64, confidence)
            
            # Send results
            await websocket.send_json(result)
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

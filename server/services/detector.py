"""
YOLOv8 Human Detection Service
"""

import os
from pathlib import Path
from typing import Optional
import numpy as np
from PIL import Image
import io

from ultralytics import YOLO


class DetectorService:
    """Human detection using YOLOv8"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize detector with YOLOv8 model
        
        Args:
            model_path: Path to custom trained model (.pt file)
                       If None, uses pretrained YOLOv8n
        """
        self.model_path = model_path or self._get_default_model()
        self.model = self._load_model()
        self.class_names = {0: "no_person", 1: "person"}
        
    def _get_default_model(self) -> str:
        """Get default model path"""
        # Check for custom trained model first
        custom_model = Path(__file__).parent.parent / "models" / "best.pt"
        if custom_model.exists():
            return str(custom_model)
        # Fall back to pretrained model (will auto-download)
        return "yolov8n.pt"
    
    def _load_model(self) -> YOLO:
        """Load YOLOv8 model"""
        print(f"Loading model from: {self.model_path}")
        return YOLO(self.model_path)
    
    def detect(self, image: Image.Image, conf_threshold: float = 0.5) -> dict:
        """
        Detect humans in image
        
        Args:
            image: PIL Image
            conf_threshold: Confidence threshold
            
        Returns:
            Detection results with bounding boxes
        """
        # Run inference - use 640 for faster inference on free tier
        results = self.model(image, conf=conf_threshold, classes=[0], imgsz=640, iou=0.5)  # class 0 = person in COCO
        
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    
                    detections.append({
                        "bbox": {
                            "x1": int(x1),
                            "y1": int(y1),
                            "x2": int(x2),
                            "y2": int(y2)
                        },
                        "confidence": round(conf, 3),
                        "class": "person",
                        "class_id": cls
                    })
        
        return {
            "detections": detections,
            "count": len(detections),
            "has_person": len(detections) > 0
        }
    
    def detect_from_bytes(self, image_bytes: bytes, conf_threshold: float = 0.5) -> dict:
        """Detect humans from image bytes"""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return self.detect(image, conf_threshold)
    
    def detect_from_base64(self, base64_str: str, conf_threshold: float = 0.5) -> dict:
        """Detect humans from base64 encoded image"""
        import base64
        # Remove data URL header if present
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
            
        image_bytes = base64.b64decode(base64_str)
        return self.detect_from_bytes(image_bytes, conf_threshold)

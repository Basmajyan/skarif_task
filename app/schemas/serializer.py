from pydantic import BaseModel
from typing import List, Optional


class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    rotation: int


class AnnotationCreate(BaseModel):
    image_data: str
    bounding_boxes: List[BoundingBox]
    meta_info: Optional[str] = None


class AnnotationUpdate(BaseModel):
    bounding_boxes: Optional[List[BoundingBox]] = None
    meta_info: Optional[str] = None


class Annotation(BaseModel):
    id: Optional[int]
    image_data: str
    bounding_boxes: List[BoundingBox]
    meta_info: Optional[str] = None

    class Config:
        from_attributes = True

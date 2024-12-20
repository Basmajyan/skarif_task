from app.schemas.serializer import (
    Annotation as AnnotationBase,
    AnnotationCreate,
    AnnotationUpdate,
)
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Annotation
from sqlalchemy.future import select
from app.db.db import get_db
import base64
import json

MAX_IMAGE_SIZE_MB = 1

router = APIRouter()


def check_for_overlaps(rectangles):
    # check if any rectangles overlap
    for i in range(len(rectangles)):
        for j in range(i + 1, len(rectangles)):
            rect1 = rectangles[i]
            rect2 = rectangles[j]
            if (
                rect1["x"] < rect2["x"] + rect2["width"]
                and rect1["x"] + rect1["width"] > rect2["x"]
                and rect1["y"] < rect2["y"] + rect2["height"]
                and rect1["y"] + rect1["height"] > rect2["y"]
            ):
                return True
    return False


@router.post("/annotations/", response_model=AnnotationBase)
async def create_annotation(
    annotation: AnnotationCreate, db: AsyncSession = Depends(get_db)
):
    # decode base64 string to binary
    image_data = base64.b64decode(annotation.image_data)

    # check image size
    image_size_mb = len(image_data) / 1024 / 1024
    if image_size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image size exceeds the limit of {MAX_IMAGE_SIZE_MB} MB",
        )

    # check for overlapping rectangles
    bounding_boxes = [box.model_dump() for box in annotation.bounding_boxes]
    if check_for_overlaps(bounding_boxes):
        raise HTTPException(
            status_code=400,
            detail="Rectangles cannot overlap. Please adjust the annotations.",
        )

    # create annotation
    db_annotation = Annotation(
        image_data=image_data,
        bounding_boxes=json.dumps(bounding_boxes),  # convert boxes to json string
        meta_info=annotation.meta_info,
    )
    db.add(db_annotation)
    await db.commit()
    await db.refresh(db_annotation)
    db_annotation.bounding_boxes = json.loads(
        db_annotation.bounding_boxes
    )  # serialize boxes to list
    db_annotation.image_data = base64.b64encode(db_annotation.image_data).decode(
        "utf-8"
    )  # encode image_data as base64 string
    return db_annotation


@router.get("/annotations/", response_model=list[AnnotationBase])
async def get_all_annotations(db: AsyncSession = Depends(get_db)):
    # get all annotations
    result = await db.execute(select(Annotation).order_by(Annotation.id))
    db_annotations = result.scalars().all()
    for annotation in db_annotations:
        annotation.bounding_boxes = json.loads(
            annotation.bounding_boxes
        )  # serialize boxes to list
        annotation.image_data = base64.b64encode(annotation.image_data).decode(
            "utf-8"
        )  # encode image_data as base64 string
    return db_annotations


@router.get("/annotations/{annotation_id}", response_model=AnnotationBase)
async def get_annotation(annotation_id: int, db: AsyncSession = Depends(get_db)):
    # get annotation by id
    result = await db.execute(select(Annotation).filter(Annotation.id == annotation_id))
    db_annotation = result.scalars().first()
    if db_annotation is None:
        raise HTTPException(status_code=404, detail="annotation not found")
    db_annotation.bounding_boxes = json.loads(
        db_annotation.bounding_boxes
    )  # serialize boxes to list
    db_annotation.image_data = base64.b64encode(db_annotation.image_data).decode(
        "utf-8"
    )  # encode image_data as base64 string
    return db_annotation  # return the found annotation


@router.put("/annotations/{annotation_id}", response_model=AnnotationBase)
async def update_annotation(
    annotation_id: int, annotation: AnnotationUpdate, db: AsyncSession = Depends(get_db)
):
    # update annotation by id
    result = await db.execute(select(Annotation).filter(Annotation.id == annotation_id))
    db_annotation = result.scalars().first()
    if db_annotation is None:
        raise HTTPException(status_code=404, detail="annotation not found")
    if annotation.bounding_boxes is not None:
        # check for overlapping rectangles
        bounding_boxes = [box.model_dump() for box in annotation.bounding_boxes]
        if check_for_overlaps(bounding_boxes):
            raise HTTPException(
                status_code=400,
                detail="Rectangles cannot overlap. Please adjust the annotations.",
            )
        # update boxes if provided
        db_annotation.bounding_boxes = json.dumps(bounding_boxes)
    if annotation.meta_info is not None:
        # update meta
        db_annotation.meta_info = annotation.meta_info
    await db.commit()
    await db.refresh(db_annotation)
    db_annotation.bounding_boxes = json.loads(
        db_annotation.bounding_boxes
    )  # serialize boxes to list
    db_annotation.image_data = base64.b64encode(db_annotation.image_data).decode(
        "utf-8"
    )  # encode image_data as base64 string
    return db_annotation


@router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: int, db: AsyncSession = Depends(get_db)):
    # delete annotation by id
    result = await db.execute(select(Annotation).filter(Annotation.id == annotation_id))
    db_annotation = result.scalars().first()
    if db_annotation is None:
        raise HTTPException(status_code=404, detail="annotation not found")
    await db.delete(db_annotation)
    await db.commit()
    return {"detail": "annotation deleted"}

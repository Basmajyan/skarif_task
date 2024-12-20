from sqlalchemy import Column, Integer, String, LargeBinary
from app.db.db import Base


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    image_data = Column(LargeBinary, nullable=False)
    bounding_boxes = Column(String, nullable=False)  # Store as JSON string
    meta_info = Column(String, nullable=True)  # Optional metadata field

    def __repr__(self):
        return f"<Annotation(id={self.id}, bounding_boxes={self.bounding_boxes})>"

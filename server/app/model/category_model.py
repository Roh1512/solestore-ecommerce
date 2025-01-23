from typing import Optional, List, Annotated
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_validator, Field
from beanie import Document, PydanticObjectId, Indexed, before_event, Save
from bson import ObjectId


class CategoryResponse(BaseModel):
    '''Category response model'''
    id: str = Field(alias="id")
    title: str
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str, ObjectId: str}
    )


class CategoryCreateRequest(BaseModel):
    '''Create Category request model'''
    title: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):
        '''Validate title'''
        if not value or value == "":
            raise ValueError("Category title is required")
        return value


class Category(Document):
    title: Annotated[str, Indexed(unique=True)]
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "categories"

    @before_event(Save)
    async def set_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

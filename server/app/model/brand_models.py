'''Brand data models'''

from typing import Annotated
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_validator, Field
from beanie import Document, PydanticObjectId, Indexed, before_event, Save


from bson import ObjectId


class BrandResponse(BaseModel):
    '''Brand Response model'''
    id: str = Field(alias="id")
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str, ObjectId: str}
    )

    @classmethod
    def from_mongo(cls, brand):
        return cls(id=str(brand.id), title=brand.title, created_at=brand.created_at, updated_at=brand.updated_at)


class BrandCreateRequest(BaseModel):
    '''Create brand request model'''
    title: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):
        '''Validate title'''
        if not value or value == "":
            raise ValueError("Brand title is required")
        return value


class Brand(Document):
    title: Annotated[str, Indexed(unique=True)]
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "brands"  # Collection name

    @before_event(Save)
    async def set_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from beanie import Document, PydanticObjectId, Indexed
from datetime import datetime, timezone
from typing import Optional, List

# Create a response model (for API responses)


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    name: Optional[str] = None
    email: EmailStr
    profile_img_url: Optional[str] = None
    profile_img_public_id: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    google_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "username": "johndoe",
                "name": "John Doe",
                "email": "john@example.com",
                "profile_img_url": "http://example.com/img.jpg",
                "profile_img_public_id": "profile/123",
                "address": "123 Main St",
                "phone": "+1234567890",
                "google_id": "12345",
                "created_at": "2024-01-02T12:00:00Z",
                "updated_at": "2024-01-02T12:00:00Z"
            }
        }
    )


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=30,
        pattern="^[a-zA-Z0-9_]+$",
        description="Username must be 3-30 characters long and can only contain letters, numbers, and underscores."
    )
    email: Optional[EmailStr] = Field(
        None,
        description="A valid email address is required."
    )
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Name must be between 1 and 50 characters."
    )
    password: Optional[str] = Field(
        None,
    )


class UpdateContactInfoRequest(BaseModel):
    phone: Optional[str] = Field(
        None,
        description="Phone number with 10 digits or including country code (e.g., +1234567890)"
    )
    address: Optional[str] = Field(
        None,
        description="Residential address"
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value:
            if not (value.isdigit() and len(value) == 10):
                raise ValueError(
                    "Phone number must be a 10-digit number."
                )
        return value

    model_config = ConfigDict(
        extra="forbid"
    )


class UserCreateRequest(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern="^[a-zA-Z0-9_]+$",
        description="Username must be 3-30 characters long and can only contain letters, numbers, and underscores."
    )
    email: EmailStr = Field(
        ...,
        description="A valid email address is required."
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password must be between 8 and 128 characters."
    )
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50,
        description="Name must be between 1 and 50 characters."
    )
    address: Optional[str] = Field(
        None,
        max_length=255,
        description="Address can be up to 255 characters long."
    )
    phone: Optional[str] = Field(
        None,
        pattern="^\+?[1-9]\d{1,14}$",
        description="Phone number must be in E.164 format (e.g., +1234567890)."
    )

    model_config = ConfigDict(extra="forbid")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value:
            if not (value.isdigit() and len(value) == 10):
                raise ValueError(
                    "Phone number must be a 10-digit number."
                )
        return value


class UserBaseModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    username: Indexed(str, unique=True)
    name: Optional[str] = None
    email: Indexed(EmailStr, unique=True)
    profile_img_url: Optional[str] = None
    profile_img_public_id: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    google_id: Optional[str] = None
    refresh_tokens: List[str] = Field(default_factory=list)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str},
        populate_by_name=True
    )


class UserModel(UserBaseModel):
    password: str

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str},
        populate_by_name=True
    )


class User(UserModel, Document):
    class Settings:
        name = "users"

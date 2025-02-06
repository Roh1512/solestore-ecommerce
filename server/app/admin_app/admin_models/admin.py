from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator, model_validator
from beanie import Document, PydanticObjectId, Indexed
from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum


class AdminRole(str, Enum):
    ADMIN = "ADMIN"
    ORDER_MANAGER = "ORDER_MANAGER"
    PRODUCT_MANAGER = "PRODUCT_MANAGER"


class AdminRoleUpdateRequest(BaseModel):
    role: AdminRole


class AdminResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    name: Optional[str] = None
    email: EmailStr
    profile_img_url: Optional[str] = None
    profile_img_public_id: Optional[str] = None
    role: AdminRole
    phone: Optional[str] = None
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
                "phone": "+1234567890",
                "created_at": "2024-01-02T12:00:00Z",
                "updated_at": "2024-01-02T12:00:00Z"
            }
        }
    )


class AdminCreateRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: AdminRole = Field(default=AdminRole.ADMIN)

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


class AdminUpdateRequest(BaseModel):
    username: Optional[str] = None
    email:  Optional[EmailStr] = None
    password:  Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None

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


class AdminBaseModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    username: Indexed(str, unique=True)
    name: Optional[str] = None
    email: Indexed(EmailStr, unique=True)
    profile_img_url: Optional[str] = None
    profile_img_public_id: Optional[str] = None
    role: AdminRole = Field(default=AdminRole.ADMIN)  # Add the enum field
    phone: Optional[str] = None
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


class AdminModel(AdminBaseModel):
    password: str

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={PydanticObjectId: str},
        populate_by_name=True
    )


class Admin(AdminModel, Document):
    class Settings:
        name = "admins"

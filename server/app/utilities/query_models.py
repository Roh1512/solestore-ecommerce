'''Models for query parameters'''

from enum import Enum
from typing import Optional

from app.admin_app.admin_models.admin import AdminRole


from pydantic import BaseModel, Field, field_validator


class SortOrder(str, Enum):
    desc = "desc"
    asc = "asc"


class SortBy(str, Enum):
    title = "title"
    date = "date"


class CBQueryParams(BaseModel):
    '''Query params for category and brand'''
    search: Optional[str] = None
    skip: int = Field(
        default=0,
        ge=0,
        description="Number of records to skip (must be >= 0)")
    limit: int = Field(
        default=10,
        ge=1,
        description="Number of records to return (must be > 1)"
    )
    sort_by: SortBy = SortBy.title
    sort_order: SortOrder = SortOrder.asc


class SortByAdmin(str, Enum):
    username = "username"
    email = "email"
    name = "name"
    date = "date"


class AdminQueryParams(BaseModel):
    '''Query params for all admin route'''
    search: Optional[str] = None
    skip: int = Field(
        default=0,
        ge=0,
        description="Number of records to skip (must be >= 0)")
    limit: int = Field(
        default=10,
        ge=1,
        description="Number of records to return (must be > 1)"
    )
    sort_by: SortByAdmin = SortBy.date
    sort_order: SortOrder = SortOrder.desc
    role: AdminRole | None = None

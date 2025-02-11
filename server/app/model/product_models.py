from typing import Annotated, Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, field_validator, Field
from beanie import Document, PydanticObjectId, Indexed, before_event, Save, Link
from bson import ObjectId
from app.model.brand_models import Brand, BrandResponse
from app.model.category_model import Category, CategoryResponse


class Size(BaseModel):
    size: int
    stock: int = 0


class Image(BaseModel):
    url: str
    public_id: str


class Product(Document):
    title: Annotated[str, Indexed()]
    description: Optional[str] = None
    price: float = Field(..., description="The price of the product")
    brand: Link[Brand] = Field(...,
                               description="The brand associated with the product")
    category: Link[Category] = Field(
        ..., description="The category associated with the product")
    images: List[Image] = []
    sizes: List[Size] = Field(default_factory=lambda: [
                              Size(size=size, stock=0) for size in range(7, 13)])
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "products"

    @before_event(Save)
    async def set_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)


class ProductCreateRequest(BaseModel):
    '''Product create request body'''
    title: str
    description: Optional[str] = Field(
        None,
        min_length=5,
        max_length=100,
        description="Description must be at least 5 characters long"
    )
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    brand: str = Field(..., description="Brand ID")
    category: str = Field(..., description="Category ID")
    sizes: Optional[List[Size]] = None

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    @field_validator("brand")
    @classmethod
    def validate_brand(cls, value):
        '''Validate brand'''
        if not value or value == None or value == "":
            raise ValueError("Please select a brand")
        return value

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        '''Validate category'''
        if not value or value == None or value == "":
            raise ValueError("Please select a category")
        return value

    @field_validator('price')
    @classmethod
    def validate_price(cls,  value):
        '''Validate price'''
        if value <= 0:
            raise ValueError("Price must be greater than 0")
        return value

    @field_validator('sizes')
    @classmethod
    def validate_sizes(cls, value):
        '''Ensure that all sizes in the array are between 7 and 12'''
        if value:
            for size in value:
                if not (7 < size.size <= 12):
                    raise ValueError(
                        f"Size {size.size} must be between 7 and 12")
        return value


class ProductDetailsRequest(BaseModel):
    '''Product create request body'''
    title: str
    description: Optional[str] = Field(
        None,
        min_length=5,
        max_length=100,
        description="Description must be at least 5 characters long"
    )
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    brand: str = Field(..., description="Brand ID")
    category: str = Field(..., description="Category ID")

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    @field_validator('price')
    @classmethod
    def validate_price(cls,  value):
        '''Validate price'''
        if value <= 0:
            raise ValueError("Price must be greater than 0")
        return value


class ProductResponse(BaseModel):
    id: str = Field(alias="id")
    title: str
    description: Optional[str] = None
    price: float
    brand: BrandResponse
    category: CategoryResponse
    images: List[Image] = []
    sizes: List[Size]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, product):
        return cls(
            id=str(product.id),
            title=product.title,
            price=product.price,
            brand=BrandResponse.from_mongo(product.brand),
            category=CategoryResponse.from_mongo(product.category),
            images=product.images,
            sizes=product.sizes,
            created_at=product.created_at,
            updated_at=product.updated_at
        )

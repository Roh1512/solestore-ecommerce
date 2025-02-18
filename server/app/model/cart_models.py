'''Models for cart item'''

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, field_validator
from beanie import Document,  before_event, Save, PydanticObjectId


class AddToCartRequest(BaseModel):
    '''Request model to add to cart'''
    product_id: str
    size: int
    quantity: int

    @field_validator("size")
    @classmethod
    def validate_size(cls, value):
        '''Ensure that all sizes in the array are between 7 and 12'''
        if value:
            if not (7 <= value <= 12):
                raise ValueError(
                    f"Size {value} must be between 7 and 12")

        return value

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, value):
        '''Ensure that all sizes in the array are between 7 and 12'''
        if value:
            if (value < 1):
                raise ValueError(
                    "Quantity must be greater than or equal to 1")

        return value


class ChangeItemQtyRequest(BaseModel):
    '''Request data to change item quantity in cart'''
    product_id: str
    size: int
    quantity: int

    @field_validator("size")
    @classmethod
    def validate_size(cls, value):
        '''Ensure that all sizes in the array are between 7 and 12'''
        if value:
            if not (7 <= value <= 12):
                raise ValueError(
                    f"Size {value} must be between 7 and 12")

        return value


class ProductInCart(Document):
    """Cart model"""
    user_id: PydanticObjectId
    product_id: PydanticObjectId = Field(
        ..., json_schema_extra={
            "unique": True}
    )
    title: str
    price: float
    size: int
    quantity: int
    image_url: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "product_in_cart"

    @before_event(Save)
    async def set_updated_at(self):
        """Update the updated_at field before saving."""
        self.updated_at = datetime.now(timezone.utc)


class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    title: str
    price: float
    size: int
    quantity: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, cart) -> "CartItemResponse":
        return cls(
            id=str(cart.id),
            user_id=str(cart.user_id),
            product_id=str(cart.product_id),
            title=cart.title,
            price=cart.price,
            size=cart.size,
            quantity=cart.quantity,
            image_url=cart.image_url,
            created_at=cart.created_at,
            updated_at=cart.updated_at
        )


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total_price: float
    total_count: int

'''Models for orders'''

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field, field_validator
from beanie import Document,  before_event, Save, PydanticObjectId, Link

from app.model.user import User, UserResponse
from app.model.cart_models import ProductInCart, CartResponse


class OrderStatus(str, Enum):
    REQUESTED = "REQUESTED"
    SHIPPED = "SHIPPED"
    PROCESSED = "PROCESSED"
    DELIVERED = "DELIVERED"


class Order(Document):
    '''Order document model'''

    user: Link[User]
    order_details: CartResponse
    address: str
    phone: str
    razor_pay_order_id: str = Field(..., json_schema_extra={"unique": True})
    razor_pay_payment_id: Optional[str] = None
    amount: float
    payment_verified: bool
    order_status: OrderStatus = Field(default=OrderStatus.REQUESTED)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "orders"
        use_enum_values = True

    @before_event(Save)
    async def set_updated_at(self):
        """Update the updated_at field before saving."""
        self.updated_at = datetime.now(timezone.utc)

    @field_validator("order_status", mode="before")
    @classmethod
    def validate_status(cls, value):
        """Ensure valid status transitions"""
        if value not in OrderStatus._value2member_map_:
            raise ValueError(f"Invalid order status: {value}")
        return value


class OrderResponse(BaseModel):
    id: str
    user: UserResponse
    order_details: CartResponse
    address: str
    phone: str
    razor_pay_order_id: str = Field(..., json_schema_extra={"unique": True})
    razor_pay_payment_id: Optional[str] = None
    total_amount: float
    payment_verified: bool
    order_status: OrderStatus = Field(default=OrderStatus.REQUESTED)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def from_mongo(cls, order):
        return cls(
            id=str(order.id),
            user=UserResponse.from_mongo(order.user),
            order_details=CartResponse.from_mongo(order.order_details),
            address=order.address,
            phone=order.phone,
            razor_pay_order_id=order.razor_pay_order_id,
            razor_pay_payment_id=order.razor_pay_payment_id,
            total_amount=order.total_amount,
            payment_verified=order.payment_verified,
            order_status=order.order_status,
            created_at=order.created_at,
            updated_at=order.updated_at
        )

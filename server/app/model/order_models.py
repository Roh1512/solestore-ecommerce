'''Models for orders'''

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field
from beanie import Document,  before_event, Save, PydanticObjectId, Link

from app.model.user import User, UserResponse
from app.model.cart_models import CartResponse


class OrderStatus(str, Enum):
    REQUESTED = "REQUESTED"
    SHIPPED = "SHIPPED"
    PROCESSING = "PROCESSING"
    DELIVERED = "DELIVERED"


class OrderCreateRequest(BaseModel):
    phone: str
    address: str


class OrderStatusUpdateRequest(BaseModel):
    order_status: OrderStatus


class CreateOrderResponse(BaseModel):
    amount: Optional[int] = None
    amount_due: Optional[int] = None
    amount_paid: Optional[int] = None
    attempts: Optional[int] = None
    created_at: Optional[int] = None
    currency: Optional[str] = None
    entity: Optional[str] = None
    id: Optional[str] = None
    notes: list[str] = None
    offer_id: Optional[str] = None
    receipt: Optional[str] = None
    status: Optional[str] = None


class Order(Document):
    '''Order document model'''
    user: Link[User]
    user_id: PydanticObjectId
    order_details: CartResponse
    address: str
    phone: str
    processing_admin: Optional[PydanticObjectId] = None
    razorpay_order_id: str = Field(..., json_schema_extra={"unique": True})
    razorpay_payment_id: Optional[str] = None
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


class OrderResponse(BaseModel):
    id: str
    user: UserResponse
    user_id: str
    order_details: CartResponse
    address: str
    phone: str
    razorpay_order_id: str = Field(..., json_schema_extra={"unique": True})
    razorpay_payment_id: Optional[str] = None
    amount: float
    payment_verified: bool
    order_status: OrderStatus = Field(default=OrderStatus.REQUESTED)
    processing_admin: Optional[str]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, order):
        return cls(
            id=str(order.id),
            user=UserResponse.from_mongo(order.user),
            user_id=str(order.user_id),
            order_details=order.order_details,
            address=order.address,
            phone=order.phone,
            razorpay_order_id=order.razorpay_order_id,
            razorpay_payment_id=order.razorpay_payment_id,
            amount=order.amount,
            payment_verified=order.payment_verified,
            order_status=order.order_status,
            processing_admin=str(order.processing_admin),
            created_at=order.created_at.isoformat(),
            updated_at=order.updated_at.isoformat()
        )

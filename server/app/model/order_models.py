'''Models for orders'''

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, field_validator
from beanie import Document,  before_event, Save, PydanticObjectId, Link

from app.model.user import User
from app.model.cart_models import ProductInCart, CartItemResponse


class Order(Document):
    '''Order document model'''

    user: Link[User]
    products: list[CartItemResponse]
    razor_pay_order_id: str = Field(..., json_schema_extra={"unique": True})
    razor_pay_payment_id: Optional[str] = None
    amount: float
    payment_verified: bool
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "orders"

    @before_event(Save)
    async def set_updated_at(self):
        """Update the updated_at field before saving."""
        self.updated_at = datetime.now(timezone.utc)

'''Order crud'''

from bson import ObjectId
from fastapi import HTTPException
from beanie import PydanticObjectId
import hmac
import hashlib
from asyncio import gather


from app.model.user import User
from app.model.cart_models import ProductInCart, CartItemResponse, CartResponse
from app.model.order_models import Order
from app.config.env_settings import settings


from app.config.razor_pay_config import razorpay_client


def generate_signature(order_id: str, payment_id: str):
    return hmac.new(
        bytes(settings.RAZOR_PAY_API_SECRET, 'utf-8'),
        msg=bytes(f"{order_id}|{payment_id}", 'utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()


async def create_order(
        user_id: str,
        amount: float,
        receipt: str = None,
        currency: str = "INR"
):
    try:
        cart_query = {"user_id": PydanticObjectId(user_id)}
        cart_pipline = [
            {"$match": cart_query},
            {
                "$group": {
                    "_id": None,
                    "totalPrice": {"$sum": {"$multiply": ["$price", "$quantity"]}},
                    "totalCount": {"$sum": "$quantity"}
                }
            }
        ]
        agg_result, cart_items = await gather(
            ProductInCart.aggregate(cart_pipline).to_list(),
            ProductInCart.find(ProductInCart.user_id == PydanticObjectId(
                user_id)).sort(("created_at", -1)).to_list()
        )
        total_price = agg_result[0]["totalPrice"]
        total_count = agg_result[0]["totalCount"]

        if total_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Cart is empty"
            )

        print(total_price)

        total_amount = round(total_price, 2)

        order_data = {
            "amount": total_amount * 100,  # amount in paise
            "currency": currency,
            "receipt": receipt or "receipt#1",
            "payment_capture": 1  # Auto-capture after payment
        }
        # Dynamically retrieve the "order" attribute
        order_obj = getattr(razorpay_client, "order")
        razorpay_order = order_obj.create(order_data)
        return razorpay_order  # This includes the generated order id

    except HTTPException as e:
        print(f"Error ordering: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def verify_payment(
        payment_id: str,
        order_id: str,
        signature: str
):
    try:
        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
        print(generate_signature(order_id=order_id, payment_id=payment_id))
        print(signature)
        utilty = getattr(razorpay_client, "utility")
        verify_payment_signature = getattr(utilty, "verify_payment_signature")
        verify_payment_signature(params_dict)

        return {"status": "Payment successful"}

    except HTTPException as e:
        print(f"Error verifying payment: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

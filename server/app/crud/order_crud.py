'''Order crud'''

import hmac
import hashlib
from asyncio import gather
from pprint import pprint
import secrets

from bson import ObjectId
from fastapi import HTTPException
from beanie import PydanticObjectId
from beanie.operators import And
from razorpay.errors import SignatureVerificationError

from app.config.socket_manager import sio
from app.model.user import User
from app.model.cart_models import ProductInCart, CartItemResponse, CartResponse
from app.model.order_models import Order, OrderResponse, OrderStatus
from app.config.env_settings import settings
from app.config.razor_pay_config import razorpay_client


def generate_signature(order_id: str, payment_id: str):
    '''A function to generate signature for'''
    return hmac.new(
        bytes(settings.RAZOR_PAY_API_SECRET, 'utf-8'),
        msg=bytes(f"{order_id}|{payment_id}", 'utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()


async def get_all_orders(
        user_id: str,
        page: int = 1
):
    '''Function to fetch users'''
    if not ObjectId.is_valid(user_id):
        raise (
            HTTPException(
                status_code=400,
                detail="Invalid user ID"
            )
        )
    limit = 20
    skip = (page - 1) * limit
    try:
        orders = await (
            Order.find(Order.user_id == PydanticObjectId(
                user_id), fetch_links=True)
            .sort(("created_at", -1))
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        orders_response = [OrderResponse.from_mongo(order) for order in orders]
        return orders_response
    except HTTPException as e:
        print("Error fetching orders: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def get_order_by_id(
        user_id: str,
        order_id: str
):
    try:
        if not ObjectId.is_valid(user_id):
            raise (
                HTTPException(
                    status_code=400,
                    detail="Invalid user ID"
                )
            )
        if not ObjectId.is_valid(order_id):
            raise (
                HTTPException(
                    status_code=400,
                    detail="Invalid order ID"
                )
            )
        order = await Order.find_one(
            And(
                Order.user_id == PydanticObjectId(user_id),
                Order.id == PydanticObjectId(order_id)
            ),
            fetch_links=True
        )
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return OrderResponse.from_mongo(order)
    except HTTPException as e:
        print("Error fetching order: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def create_order(
        user_id: str,
        address: str,
        phone: str,
        currency: str = "INR",
):
    '''Function to create an order and initialize payment'''
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user Id"
            )
        if not address and phone:
            raise HTTPException(
                status_code=400,
                detail="Please provide address and phone number for your order"
            )
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
        agg_result, cart_items, user = await gather(
            ProductInCart.aggregate(cart_pipline).to_list(),
            ProductInCart.find(ProductInCart.user_id == PydanticObjectId(
                user_id)).sort(("created_at", -1)).to_list(),
            User.get(PydanticObjectId(user_id))
        )
        total_price = agg_result[0]["totalPrice"]
        total_count = agg_result[0]["totalCount"]

        if total_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Cart is empty"
            )

        cart_items_response = [
            CartItemResponse.from_mongo(item) for item in cart_items]

        order_details = CartResponse(
            items=cart_items_response,
            total_price=round(total_price, 2),
            total_count=total_count
        )

        total_amount = round(total_price, 2)
        random_str = secrets.token_hex(4)  # 8 characters
        receipt = f"recept_{random_str}"

        order_data = {
            "amount": total_amount * 100,  # amount in paise
            "currency": currency,
            "receipt": receipt or "receipt#1",
            "payment_capture": 1  # Auto-capture after payment
        }
        # Dynamically retrieve the "order" attribute
        order_obj = getattr(razorpay_client, "order")
        razorpay_order = order_obj.create(order_data)

        # print("RayzorPay Order", razorpay_order)

        order = Order(
            user=user,
            user_id=PydanticObjectId(user_id),
            order_details=order_details,
            address=address,
            phone=phone,
            razorpay_order_id=razorpay_order["id"],
            amount=total_amount,
            payment_verified=False,
            order_status=OrderStatus.REQUESTED,
        )
        new_order = await order.save()
        # print("NEW ORDER: ", new_order.id, new_order.razorpay_order_id)

        return razorpay_order  # This includes the generated order id

    except HTTPException as e:
        print(f"Error ordering: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def verify_payment(payment_id: str, order_id: str, signature: str, user_id: str):
    '''Function to verify razorpay payment'''
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid user Id"
            )
        order = await Order.find_one(
            And(
                Order.user_id == PydanticObjectId(user_id),
                Order.razorpay_order_id == order_id
            ),
            fetch_links=True
        )
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # pprint(order.model_dump())

        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
        utilty = getattr(razorpay_client, "utility")
        verify_payment_signature = getattr(utilty, "verify_payment_signature")
        verified_payment = verify_payment_signature(params_dict)

        if not verified_payment:
            raise HTTPException(status_code=400, detail="Payment failed")

        order.razorpay_payment_id = payment_id
        order.payment_verified = True
        await order.save()

        order_response = OrderResponse.from_mongo(order)

        # Emit an event to notify all admins (all admin clients should join the "admin" room)
        await sio.emit("new-order", order_response.model_dump_json(), room="admin")

        return order_response

    except SignatureVerificationError as e:
        print("SignatureVerificationError: ", e)
        raise HTTPException(status_code=400, detail="Payment failed") from e
    except Exception as e:
        print(f"Error verifying payment: {e}")
        # import traceback
        # traceback.print_exc()  # Print full stack trace
        raise HTTPException(
            status_code=500, detail="Internal server error") from e

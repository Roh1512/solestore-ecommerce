'''Order admin crud operations'''

from bson import ObjectId
from pprint import pformat

from fastapi import HTTPException
from beanie import PydanticObjectId

from app.model.order_models import Order, OrderResponse, OrderStatus
from app.config.socket_manager import sio


async def get_orders_admin(
        page: int = 1
):
    '''Function to fetch all orders in admin'''
    try:
        limit = 20
        skip = (page - 1) * limit
        orders = await (
            Order.find(fetch_links=True)
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


async def get_order_by_id(order_id: str):
    try:
        if not ObjectId.is_valid(order_id):
            raise (
                HTTPException(
                    status_code=400,
                    detail="Invalid order ID"
                )
            )
        order = await Order.find_one(
            Order.id == PydanticObjectId(order_id),
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


async def update_order_status(order_id: str, order_status: OrderStatus):
    '''Function to update order status'''
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid order ID"
            )
        order = await Order.find_one(Order.id == PydanticObjectId(order_id), fetch_links=True)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order.order_status = order_status
        await order.save()

        # Convert to response model
        response_order = OrderResponse.from_mongo(order)
        print(pformat(response_order.model_dump_json()))
        await sio.emit("order-updated", response_order.model_dump_json(), room=str(order.user_id))

        return response_order
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

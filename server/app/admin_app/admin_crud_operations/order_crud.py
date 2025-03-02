'''Order admin crud operations'''

from bson import ObjectId

from fastapi import HTTPException
from beanie import PydanticObjectId
from beanie.operators import And

from app.model.order_models import Order, OrderResponse, OrderStatus, OrdersBeingProcessed, OrdersBeingProcessedResponse
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


async def add_to_orders_being_processed(order_id: str, admin_id: str) -> OrdersBeingProcessedResponse:
    '''Function to add order to orders being processed'''
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid order ID"
            )
        if not ObjectId.is_valid(admin_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid admin ID"
            )
        order = await Order.find_one(Order.id == PydanticObjectId(order_id), fetch_links=True)
        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )
        order.order_status = OrderStatus.PROCESSING
        order.processing_admin = PydanticObjectId(admin_id)
        await order.save()
        is_already_processing = await OrdersBeingProcessed.find_one(OrdersBeingProcessed.order_id == PydanticObjectId(order_id))
        if is_already_processing:
            raise HTTPException(
                status_code=400,
                detail="Order is already processing by someone"
            )
        order_to_process = OrdersBeingProcessed(
            order_id=PydanticObjectId(order_id),
            admin_id=PydanticObjectId(admin_id)
        )
        await order_to_process.insert()
        await sio.emit("order-updated", OrderResponse.from_mongo(order).model_dump_json(), room="admin")
        return OrdersBeingProcessedResponse.from_mongo(order_to_process)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def remove_from_orders_being_processed(order_id: str, admin_id: str) -> OrdersBeingProcessedResponse:
    '''Function to remove order from orders being processed'''
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid order ID"
            )
        if not ObjectId.is_valid(admin_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid admin ID"
            )
        order = await Order.find_one(Order.id == PydanticObjectId(order_id), fetch_links=True)
        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        order_to_remove = await OrdersBeingProcessed.find_one(
            OrdersBeingProcessed.order_id == PydanticObjectId(order_id),
        )
        if not order_to_remove:
            raise HTTPException(
                status_code=404, detail="Order not found in orders being processed")
        if order_to_remove.admin_id != PydanticObjectId(admin_id):
            raise HTTPException(
                status_code=403, detail="Admin not authorized to remove order")
        await order_to_remove.delete()

        order.order_status = OrderStatus.REQUESTED
        order.processing_admin = None
        await order.save()

        await sio.emit("order-updated", OrderResponse.from_mongo(order).model_dump_json(), room="admin")

        return OrdersBeingProcessedResponse.from_mongo(order_to_remove)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def is_order_being_processed(order_id: str, admin_id: str):
    try:
        order_exists = await OrdersBeingProcessed.find_one(
            And(
                OrdersBeingProcessed.admin_id == PydanticObjectId(admin_id),
                OrdersBeingProcessed.order_id == PydanticObjectId(order_id)
            )
        )
        if not order_exists:
            raise HTTPException(
                status_code=404,
                detail="Order is not being processed"
            )
        return OrdersBeingProcessedResponse.from_mongo(order_exists)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def update_order_status(order_id: str, order_status: OrderStatus, admin_id: str):
    '''Function to update order status'''
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid order ID"
            )
        order_being_processed = None
        order = await Order.find_one(Order.id == PydanticObjectId(order_id), fetch_links=True)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order_being_processed = await OrdersBeingProcessed.find_one(
            OrdersBeingProcessed.order_id == PydanticObjectId(order_id)
        )
        if not order_being_processed:
            raise HTTPException(
                status_code=400,
                detail="Start processing the order before updating it."
            )
        if order_being_processed and order_being_processed.admin_id != PydanticObjectId(admin_id):
            raise HTTPException(
                status_code=403,
                detail="Some one else is processing this order"
            )
        if order_being_processed and order_being_processed.admin_id == PydanticObjectId(admin_id):
            try:
                await OrdersBeingProcessed.find(
                    And(
                        OrdersBeingProcessed.order_id == PydanticObjectId(
                            order_id),
                        OrdersBeingProcessed.admin_id == PydanticObjectId(
                            admin_id)
                    )
                ).delete()
            except HTTPException as e:
                raise HTTPException(
                    status_code=400,
                    detail="Error removing order from being processed"
                ) from e

        order.order_status = order_status
        order.processing_admin = None
        await order.save()

        # Convert to response model
        response_order = OrderResponse.from_mongo(order)
        await sio.emit("order-updated", response_order.model_dump_json(), room=str(order.user_id))
        await sio.emit("order-updated", response_order.model_dump_json(), room="admin")

        return response_order
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

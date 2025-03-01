'''Order routes user'''

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.exceptions import HTTPException

from app.model.order_models import OrderResponse, OrderCreateRequest, CreateOrderResponse
from app.utilities.query_models import OrderQueryParams
from app.crud.order_crud import create_order, verify_payment, get_all_orders, get_order_by_id
from app.utilities.auth_utils import get_current_user


router = APIRouter()


@router.get("/", status_code=200,
            response_model=list[OrderResponse])
async def get_all_orders_route(
    user: Annotated[dict, Depends(get_current_user)],
    query: Annotated[OrderQueryParams, Depends()]
):
    '''Get all orders by user route'''
    try:
        return await get_all_orders(
            user_id=str(user.id),
            page=query.page
        )
    except HTTPException as e:
        print("Error fetching orders: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error fetching orders: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching orders"
        ) from e


@router.get("/{order_id}", status_code=200,
            response_model=OrderResponse)
async def get_order_by_id_route(
    user: Annotated[dict, Depends(get_current_user)],
    order_id: str
):
    try:
        return await get_order_by_id(
            user_id=str(user.id),
            order_id=order_id
        )
    except HTTPException as e:
        print("Error fetching order: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error fetching order: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching order"
        ) from e


@router.post("/create-order", status_code=200, response_model=CreateOrderResponse)
async def create_order_route(
    user: Annotated[dict, Depends(get_current_user)],
    body: OrderCreateRequest
):
    '''route to create an order'''
    try:
        return await create_order(
            address=body.address,
            phone=body.phone,
            user_id=str(user.id)
        )
    except HTTPException as e:
        print("Error fetching creating order: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error creating order: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error creating order"
        ) from e


@router.post("/verify-payment", status_code=200)
async def verify_payment_route(
    user: Annotated[dict, Depends(get_current_user)],
    request: Request
):
    try:
        data = await request.json()
        return await verify_payment(
            payment_id=data.get("razorpay_payment_id"),
            order_id=data.get("razorpay_order_id"),
            signature=data.get("razorpay_signature"),
            user_id=str(user.id)
        )
    except HTTPException as e:
        print("Error verifying payment order: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error verifying payment order: {e}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(
            status_code=500,
            detail="Unexpected error verifying paymen"
        ) from e

'''Admin Order Routes'''

from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException

from app.admin_app.admin_crud_operations.order_crud import get_orders_admin, update_order_status, get_order_by_id
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_models.admin import AdminRole
from app.model.order_models import OrderResponse, OrderStatusUpdateRequest
from app.utilities.query_models import OrderQueryParams


router = APIRouter()


@router.get("/", status_code=200, response_model=list[OrderResponse])
async def get_all_orders_admin_route(
    admin: Annotated[dict, Depends(get_current_admin)],
    query: Annotated[OrderQueryParams, Depends()]
):
    '''Get all orders admin'''
    try:
        return await get_orders_admin(
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


@router.get("/{order_id}", response_model=OrderResponse, status_code=200)
async def get_order_admin(
    admin: Annotated[dict, Depends(get_current_admin)],
    order_id: str
):
    '''Get order by id'''
    try:
        return await get_order_by_id(
            order_id=order_id
        )
    except HTTPException as e:
        print("Error updating order status: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error updating order status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error updating order status"
        ) from e


@router.put("/{order_id}/update-status", status_code=200, response_model=OrderResponse)
async def update_order_status_route(
    admin: Annotated[dict, Depends(get_current_admin)],
    body: OrderStatusUpdateRequest,
    order_id: str
):
    '''Update order status page'''
    try:
        return await update_order_status(
            order_id=order_id,
            order_status=body.order_status
        )
    except HTTPException as e:
        print("Error updating order status: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error updating order status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error updating order status"
        ) from e

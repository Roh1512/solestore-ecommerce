from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.exceptions import HTTPException

from app.crud.order_crud import create_order, verify_payment
from app.utilities.auth_utils import get_current_user


router = APIRouter()


@router.post("/create-order", status_code=200)
async def create_order_route(
    user: Annotated[dict, Depends(get_current_user)],
    request: Request
):
    try:
        data = await request.json()
        return await create_order(
            address=data.get("address") or user.address,
            phone=data.get("phone") or user.phone,
            receipt=data.get("receipt"),
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

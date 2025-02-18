'''Cart Routes'''

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException

from app.crud.cart_crud import get_cart_items, add_to_cart, remove_item_from_cart, change_item_quantity
from app.model.cart_models import CartResponse, CartItemResponse, AddToCartRequest, ChangeItemQtyRequest
from app.utilities.auth_utils import get_current_user
from app.utilities.query_models import CartQueryParams


router = APIRouter()


@router.get("/", status_code=200, response_model=CartResponse)
async def get_cart_route(
    user: Annotated[dict, Depends(get_current_user)],
    query_params: Annotated[CartQueryParams, Depends()]
):
    '''Get Cart Items Route'''
    try:
        return await get_cart_items(
            user_id=str(user.id),
            page=query_params.page,
            search=query_params.search
        )
    except HTTPException as e:
        print("Error fetching cart from route: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error fetching cart: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching cart"
        ) from e


@router.post("/add", status_code=201, response_model=CartItemResponse)
async def add_to_cart_route(
    user: Annotated[dict, Depends(get_current_user)],
    body: AddToCartRequest
):
    '''Route to add to cart'''
    try:
        return await add_to_cart(
            product_id=body.product_id,
            user_id=str(user.id),
            quantity=body.quantity,
            size=body.size
        )
    except HTTPException as e:
        print("Error adding to from route: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error adding cart: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error adding cart"
        ) from e


@router.delete("/{cart_id}", status_code=200, response_model=CartItemResponse)
async def change_item_quantity_route(
    user: Annotated[dict, Depends(get_current_user)],
    cart_id: str,
):
    '''Change quantity of item in cart'''
    try:
        return await remove_item_from_cart(
            user_id=str(user.id),
            cart_id=cart_id
        )
    except HTTPException as e:
        print("Error changing item quantity from route: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected changing item quantity: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error changing item quantity"
        ) from e


@router.put("/{cart_id}/change-quantity", response_model=CartItemResponse, status_code=200)
async def remove_item_cart_route(
    user: Annotated[dict, Depends(get_current_user)],
    cart_id: str,
    body: ChangeItemQtyRequest
):
    '''Route to change quantity of item in cart'''
    try:
        return await change_item_quantity(
            cart_id=cart_id,
            product_id=body.product_id,
            user_id=str(user.id),
            quantity=body.quantity,
            size=body.size
        )
    except HTTPException as e:
        print("Error removing item from route: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error removing item from cart: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error removing item from cart"
        ) from e

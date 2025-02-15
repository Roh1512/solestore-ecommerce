'''Shop Product Routes'''

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException

from app.crud.product_crud import get_products, get_product_by_id
from app.model.product_models import ProductResponse

from app.utilities.auth_utils import get_current_user
from app.utilities.query_models import ProductQueryParams

router = APIRouter()


@router.get("/", status_code=200, response_model=list[ProductResponse])
async def get_all_products(
    user: Annotated[dict, Depends(get_current_user)],
    query_params: Annotated[ProductQueryParams, Depends()]
):
    '''Get all products route'''
    try:
        return await get_products(
            search=query_params.search,
            size=query_params.size,
            brand=query_params.brand,
            category=query_params.category,
            page=query_params.page,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order
        )
    except HTTPException as e:
        print("Error fetching products: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print("Unexpected error fetching products route: ", e)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching products"
        ) from e


@router.get("/{product_id}", status_code=200, response_model=ProductResponse)
async def get_product_by_id_route(
    user: Annotated[dict, Depends(get_current_user)],
    product_id: str
):
    '''Get product route'''
    try:
        return await get_product_by_id(product_id)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Error fetching product: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching product"
        ) from e

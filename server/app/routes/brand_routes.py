'''Brand routes for the store'''

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.exceptions import HTTPException
from app.utilities.auth_utils import get_current_user
from app.model.brand_models import BrandResponse
from app.crud.brand_crud import get_brands

from app.utilities.query_models import SortBy, SortOrder


router = APIRouter()


@router.get("/", status_code=200, response_model=list[BrandResponse])
async def get_all_brands(
    user: Annotated[dict, Depends(get_current_user)],
    search: Optional[str] = Query(
        None, description="Search term for brand title"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, description="Number of records to return"),
    sort_by: SortBy = Query(SortBy.title,
                            description="Field to sort by (date or title)", ),
    sort_order: SortOrder = Query(SortOrder.asc,
                                  description="Sort order (asc or desc)")
):
    '''GET ALL BRANDS ROUTE'''
    try:
        return await get_brands(
            search=search,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching brands"
        ) from e

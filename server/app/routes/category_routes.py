'''Category routes for the store'''

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.exceptions import HTTPException
from app.utilities.auth_utils import get_current_user
from app.model.category_model import CategoryResponse
from app.crud.category_crud import get_categories

from app.utilities.query_models import SortBy, SortOrder, CBQueryParams


router = APIRouter()


@router.get("/", status_code=200, response_model=list[CategoryResponse])
async def get_all_categories(
    user: Annotated[dict, Depends(get_current_user)],
    query_params: Annotated[CBQueryParams, Depends()]
):
    '''Get all categories route'''
    try:
        return await get_categories(
            search=query_params.search,
            skip=query_params.skip,
            limit=query_params.limit,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching categories"
        ) from e

'''Admin Category routes'''

from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException

from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_models.admin import AdminRole
from app.model.category_model import CategoryCreateRequest, CategoryResponse
from app.admin_app.admin_crud_operations.category_crud import create_category, edit_category, delete_category
from app.crud.category_crud import get_categories

from app.utilities.query_models import CBQueryParams
from app.utilities.response_message_models import SuccessMessage

router = APIRouter()


@router.get("/", status_code=200, response_model=list[CategoryResponse])
async def get_all_categories(
    admin: Annotated[dict, Depends(get_current_admin)],
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


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=CategoryResponse)
async def category_create(
    admin: Annotated[dict, Depends(get_current_admin)],
    category: CategoryCreateRequest
):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    if not category or category.title == "":
        raise HTTPException(
            status_code=400,
            detail="Category title is required"
        )
    category_dict = category.model_dump()

    try:
        return await create_category(category_dict)
    except HTTPException as e:
        print(f"Error creating category: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print("Unexpected error creating category: ", e)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error creating category"
        ) from e


@router.put("/{category_id}", status_code=200, response_model=CategoryResponse)
async def category_update(
    admin: Annotated[dict, Depends(get_current_admin)],
    category: CategoryCreateRequest,
    category_id: str
):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        return await edit_category(
            category_data=category,
            category_id=category_id
        )
    except HTTPException as e:
        print("Http exception edting category")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error editing category"
        ) from e


@router.delete("/{category_id}", status_code=200, response_model=SuccessMessage)
async def category_delete(
    admin: Annotated[dict, Depends(get_current_admin)],
    category_id: str
):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        return await delete_category(str(category_id))
    except HTTPException as e:
        print("Http exception deleting category")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error edeleting category"
        ) from e

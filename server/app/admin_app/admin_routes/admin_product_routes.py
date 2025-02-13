'''Admin Product routes'''

from typing import Annotated

from fastapi import APIRouter, Depends, status, UploadFile, File
from fastapi.exceptions import HTTPException


from app.admin_app.admin_crud_operations.product_crud import (
    add_product,
    add_images_product,
    get_products,
    get_product_by_id,
    update_product_details,
    delete_images_product,
    update_product_sizes,
    delete_products,
    delete_single_product
)
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_models.admin import AdminRole
from app.model.product_models import (
    ProductCreateRequest,
    ProductResponse,
    ProductDetailsRequest,
    DeleteImagesRequest,
    ProductSizeStockRequest,
    DeleteProductsRequests
)
from app.utilities.query_models import ProductQueryParams

router = APIRouter()


@router.get("/", status_code=200, response_model=list[ProductResponse])
async def get_all_products_admin(
    admin: Annotated[dict, Depends(get_current_admin)],
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


@router.post("/", status_code=201, response_model=ProductResponse)
async def product_create(
    admin: Annotated[dict, Depends(get_current_admin)],
    product: ProductCreateRequest
):
    '''Add product route'''
    if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        return await add_product(product)
    except HTTPException as e:
        print(f"Error in adding product, HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error in adding product: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected Error in adding product"
        ) from e


@router.delete("/delete-products", status_code=200, response_model=list[ProductResponse])
async def delete_multiple_products(
    admin: Annotated[dict, Depends(get_current_admin)],
    products: DeleteProductsRequests
):
    '''Route to delete multiple products'''
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        return await delete_products(product_ids=products.product_ids)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


@router.get("/{product_id}", status_code=200, response_model=ProductResponse)
async def product_by_id(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
):
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


@router.put("/{product_id}", status_code=200, response_model=ProductResponse)
async def prodcut_details_update(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
    product_data: ProductDetailsRequest
):
    '''Update product details route'''
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        return await update_product_details(product_data=product_data, product_id=product_id)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error editing product: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected Error editing product"
        ) from e


@router.delete("/{product_id}", status_code=200, response_model=ProductResponse)
async def delete_product(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
):
    '''ROute to delete a single product'''
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        return await delete_single_product(product_id)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error deleting product"
        ) from e


@router.put("/{product_id}/update-size-stock", status_code=200, response_model=ProductResponse)
async def product_size_stock_update(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
    size_data: ProductSizeStockRequest
):
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        return await update_product_sizes(
            product_id,
            size_data
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Error updating size and stock: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error updating size and stock"
        ) from e


@router.put("/{product_id}/add-image", status_code=201, response_model=ProductResponse)
async def add_images(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
    images: list[UploadFile] = File(...),
):
    '''Add image product route'''
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        for image in images:
            if image.content_type.lower() not in ["image/jpeg", "image/png", "image/jpg",]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only jpeg, png and jpg images are accepted"
                )
            return await add_images_product(product_id, images)
    except HTTPException as e:
        print(f"Error adding image HTTP: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Error adding image Unexpected: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error adding product images"
        ) from e


@router.put("/{product_id}/delete-images", status_code=200, response_model=ProductResponse)
async def delete_images(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
    public_ids: DeleteImagesRequest
):
    '''Delete image product route'''
    try:
        if admin["role"] not in {AdminRole.ADMIN, AdminRole.PRODUCT_MANAGER}:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized for this action"
            )
        return await delete_images_product(
            product_id=product_id,
            public_ids=public_ids.public_ids
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        )from e
    except Exception as e:
        print("Error deleting images: ", e)
        raise HTTPException(
            status_code=500,
            detail="Error deleting images"
        ) from e

'''Brand get function'''
from fastapi import HTTPException

from app.model.brand_models import Brand, BrandResponse
from app.utilities.query_models import SortBy, SortOrder


async def get_brands(
    search: str = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: SortBy = "title",
    sort_order: SortOrder = "asc"
) -> BrandResponse:
    '''Function to get brands by queries'''
    try:
        query = {}
        if search:
            # Case-insensitive search
            query["title"] = {"$regex": search, "$options": "i"}
        order = -1 if sort_order == SortOrder.desc else 1

        if sort_by not in ["date", "title"]:
            raise HTTPException(
                status_code=400, detail="Invalid sort_by field")
        if sort_by == "date":
            sort_by = "created_at"

        results: list[BrandResponse] = (
            await Brand.find(query)
            .sort((sort_by, order))
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        brands_list = []
        for result in results:
            result_dict = result.model_dump()
            result_dict["id"] = str(result.id)
            brands_list.append(result_dict)
        return brands_list
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

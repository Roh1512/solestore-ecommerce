'''Category get crud functions'''
from fastapi import HTTPException

from app.model.category_model import Category, CategoryResponse
from app.utilities.query_models import SortBy, SortOrder


async def get_categories(
    search: str = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: SortBy = "title",
    sort_order: SortOrder = "asc"
) -> CategoryResponse:
    '''Function to get categories by queries'''
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

        results: list[CategoryResponse] = (
            await Category.find(query)
            .sort((sort_by, order))
            .skip(skip)
            .limit(limit)
            .to_list()
        )

        category_list = []

        for result in results:
            result_dict = result.model_dump()
            result_dict["id"] = str(result.id)
            category_list.append(result_dict)

        return category_list

    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

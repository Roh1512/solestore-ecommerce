import { CategoryResponse } from "@/client";
import { useDeleteCategoryMutation } from "@/features/categoryApiSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import DeleteCategory from "./DeleteCategory";
import EditCategory from "./EditCategory";

import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";

type Props = {
  category: CategoryResponse;
};

const Category = (props: Props) => {
  const [deleteCategory, { data, isLoading, isSuccess, isError, error }] =
    useDeleteCategoryMutation();
  const currentCategoryId = props.category.id;

  const handleDeleteCategory = async () => {
    try {
      const res = await deleteCategory({
        categoryId: props.category.id,
      }).unwrap();
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Brand deleted");
    }
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
      } else {
        toast.error("Error deleting brand");
      }
    }
  }, [data?.message, error, isError, isSuccess]);

  return (
    <div className="bg-base-200 p-2 shadow-lg flex flex-row items-center justify-between min-w-64 rounded-xl max-h-fit">
      <h2 className="card-title text-2xl font-bold" tabIndex={0}>
        {props.category.title}
      </h2>
      <div className="flex gap-0">
        <EditCategory
          category={props.category}
          editCategoryId={props.category.id}
        />
        <DeleteCategory
          category={props.category}
          onDelete={handleDeleteCategory}
          deleteCategoryId={currentCategoryId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Category;

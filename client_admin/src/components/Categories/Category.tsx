import { CategoryResponse } from "@/client";
import DeleteCategory from "./DeleteCategory";
import EditCategory from "./EditCategory";
import { memo } from "react";

type Props = {
  category: CategoryResponse;
};

const Category = (props: Props) => {
  const currentCategoryId = props.category.id;

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
          deleteCategoryId={currentCategoryId}
        />
      </div>
    </div>
  );
};

export default memo(Category);

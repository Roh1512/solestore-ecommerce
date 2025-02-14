import { SortOrder, SortByProduct } from "@/types/queryTypes";
import {
  ArrowUpDown,
  ArrowDownAZ,
  ArrowDownZA,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import { memo } from "react";

type Props = {
  updateParams: (newParams: {
    page?: string;
    sortBy?: SortByProduct;
    sortOrder?: SortOrder;
  }) => void;
  sortBy: SortByProduct | null;
  sortOrder: SortOrder | null;
};

const SortProducts = memo(({ updateParams, sortBy, sortOrder }: Props) => {
  return (
    <div className="dropdown dropdown-bottom text-2xl">
      <div
        tabIndex={0}
        role="button"
        className="btn bg-base-300 text-base-content m-1"
      >
        <ArrowUpDown className="w-5 h-5" />
        <span className="text-lg">Sort By</span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2"
      >
        <h4 className="text-md font-bold">Sort</h4>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <CalendarArrowDown />
            <span className="label-text text-lg font-bold">Latest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={
                sortBy === SortByProduct.DATE && sortOrder === SortOrder.Desc
              }
              onChange={() =>
                updateParams({
                  sortBy: SortByProduct.DATE,
                  sortOrder: SortOrder.Desc,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <CalendarArrowUp />
            <span className="label-text text-lg font-bold">Oldest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              checked={
                sortBy === SortByProduct.DATE && sortOrder === SortOrder.Asc
              }
              onChange={() =>
                updateParams({
                  sortBy: SortByProduct.DATE,
                  sortOrder: SortOrder.Asc,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <ArrowDownAZ />
            <span className="label-text text-md font-bold">Price lowest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              checked={
                sortBy === SortByProduct.PRICE && sortOrder === SortOrder.Asc
              }
              onChange={() =>
                updateParams({
                  sortBy: SortByProduct.PRICE,
                  sortOrder: SortOrder.Asc,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <ArrowDownZA />
            <span className="label-text text-md font-bold">Price highest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              checked={
                sortBy === SortByProduct.PRICE && sortOrder === SortOrder.Desc
              }
              onChange={() =>
                updateParams({
                  sortBy: SortByProduct.PRICE,
                  sortOrder: SortOrder.Desc,
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
});

export default SortProducts;

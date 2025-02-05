import { SortBy, SortOrder } from "@/types/queryTypes";
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
    sortBy?: string;
    sortOrder?: string;
  }) => void;
  sortBy: SortBy | null;
  sortOrder: SortOrder | null;
};

const Sort = memo(({ updateParams, sortBy, sortOrder }: Props) => {
  return (
    <div className="dropdown dropdown-bottom dropdown-end text-2xl">
      <div tabIndex={0} role="button" className="btn btn-primary m-1">
        <ArrowUpDown className="w-5 h-5" />
        <span className="logo-text">Sort By</span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2"
      >
        <h4 className="text-md font-bold">Sort By</h4>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <CalendarArrowDown />
            <span className="label-text text-lg font-bold">Latest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={sortBy === SortBy.Date && sortOrder === SortOrder.Desc}
              onChange={() =>
                updateParams({
                  sortBy: SortBy.Date,
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
              checked={sortBy === SortBy.Date && sortOrder === SortOrder.Asc}
              onChange={() =>
                updateParams({
                  sortBy: SortBy.Date,
                  sortOrder: SortOrder.Asc,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <ArrowDownAZ />
            <span className="label-text text-md font-bold">
              Title: Ascending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              checked={sortBy === SortBy.Title && sortOrder === SortOrder.Asc}
              onChange={() =>
                updateParams({
                  sortBy: SortBy.Title,
                  sortOrder: SortOrder.Asc,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <ArrowDownZA />
            <span className="label-text text-md font-bold">
              Title: Descending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              checked={sortBy === SortBy.Title && sortOrder === SortOrder.Desc}
              onChange={() =>
                updateParams({
                  sortBy: SortBy.Title,
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

export default Sort;

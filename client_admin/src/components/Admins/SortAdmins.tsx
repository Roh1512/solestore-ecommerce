import {
  ArrowDownAZ,
  ArrowDownZA,
  ArrowUpDown,
  CalendarArrowDown,
  CalendarArrowUp,
  Mail,
} from "lucide-react";
import { memo } from "react";
import { SortByAdmin, SortOrder } from "@/types/queryTypes";

type Props = {
  updateParams: (newParams: {
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => void;
};

const SortAdmins = memo(({ updateParams }: Props) => {
  return (
    <div className="dropdown dropdown-bottom dropdown-end text-2xl">
      <div tabIndex={0} role="button" className="btn btn-sm btn-primary m-1">
        <ArrowUpDown className="w-5 h-5" />
        <span className="logo-text">Sort By</span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-[1] sm:w-52 p-2 shadow gap-2"
      >
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <CalendarArrowDown />
            <span className="label-text text-lg font-bold">Latest</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              defaultChecked
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.date,
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
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.date,
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
              Username: Ascending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.username,
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
              Username: Descending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.username,
                  sortOrder: SortOrder.Desc,
                })
              }
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <ArrowDownZA />
            <span className="label-text text-md font-bold">
              Name: Ascending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.name,
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
              Name: Descending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.name,
                  sortOrder: SortOrder.Desc,
                })
              }
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <Mail />
            <span className="label-text text-md font-bold">
              Email: Ascending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.email,
                  sortOrder: SortOrder.Asc,
                })
              }
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer flex bg-base-200">
            <Mail />
            <span className="label-text text-md font-bold">
              Email: Descending
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio "
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.email,
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

export default SortAdmins;

import { SortByAdmin, SortOrder } from "@/types/queryTypes";
import { ArrowUpDown } from "lucide-react";
import { memo } from "react";

type Props = {
  updateParams: (newParams: {
    page?: string;
    sortBy?: string;
    sortOrder?: string;
    role?: string;
  }) => void;
  sortBy: SortByAdmin | null;
  sortOrder: SortOrder | null;
};

const SortAdmins = memo(({ updateParams, sortBy, sortOrder }: Props) => {
  return (
    <div className="dropdown dropdown-bottom text-2xl">
      <div tabIndex={0} role="button" className="btn btn-sm btn-primary m-1">
        <ArrowUpDown className="w-5 h-5" />
        <span className="logo-text">Sort By</span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2"
      >
        <div className="form-control">
          <label
            className="label cursor-pointer bg-base-200 flex"
            htmlFor="latest"
          >
            <span className="label-text text-md font-bold">Latest</span>
            <input
              type="radio"
              name="sortoption"
              id="latest"
              className="radio"
              checked={
                sortBy === SortByAdmin.date && sortOrder === SortOrder.Desc
              }
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
          <label
            className="label cursor-pointer bg-base-200 flex"
            htmlFor="oldest"
          >
            <span className="label-text text-md font-bold">Oldest</span>
            <input
              type="radio"
              name="sortoption"
              id="oldest"
              className="radio"
              checked={
                sortBy === SortByAdmin.date && sortOrder === SortOrder.Asc
              }
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
          <label
            className="label cursor-pointer bg-base-200 flex"
            htmlFor="username-asc"
          >
            <span className="label-text text-md font-bold">
              Username [A to Z]
            </span>
            <input
              type="radio"
              name="sortoption"
              id="username-asc"
              className="radio"
              checked={
                sortBy === SortByAdmin.username && sortOrder === SortOrder.Asc
              }
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
          <label
            className="label cursor-pointer bg-base-200 flex"
            htmlFor="username-desc"
          >
            <span className="label-text text-md font-bold">
              Username [Z to A]
            </span>
            <input
              type="radio"
              name="sortoption"
              id="username-desc"
              className="radio"
              checked={
                sortBy === SortByAdmin.username && sortOrder === SortOrder.Desc
              }
              onChange={() =>
                updateParams({
                  sortBy: SortByAdmin.username,
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

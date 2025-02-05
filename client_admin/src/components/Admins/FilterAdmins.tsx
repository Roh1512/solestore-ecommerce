import { AdminRole } from "@/types/queryTypes";
import { ListFilter } from "lucide-react";

type Props = {
  updateParams: (newParams: { role?: string }) => void;
  removeParam: (param: string) => void;
  role: AdminRole | null;
};

const FilterAdmins = ({ updateParams, removeParam, role }: Props) => {
  return (
    <div className="dropdown dropdown-bottom dropdown-end text-2xl">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-outline btn-sm btn-primary m-1"
      >
        <ListFilter className="w-5 h-5" />
        <span className="logo-text">Filter by role</span>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-[1] w-52 p-2 shadow gap-2"
      >
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex items-center justify-between gap-8">
            <span className="label-text text-lg font-bold">All</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={!role}
              onChange={() => removeParam("role")}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <span className="label-text text-md font-bold">Admins</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={role === AdminRole.ADMIN}
              onChange={() =>
                updateParams({
                  role: AdminRole.ADMIN,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <span className="label-text text-sm font-bold">Order managers</span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={role === AdminRole.ORDER_MANAGER}
              onChange={() =>
                updateParams({
                  role: AdminRole.ORDER_MANAGER,
                })
              }
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer bg-base-200 flex">
            <span className="label-text text-sm font-bold">
              Product managers
            </span>
            <input
              type="radio"
              name="sort-option"
              className="radio"
              checked={role === AdminRole.PRODUCT_MANAGER}
              onChange={() =>
                updateParams({
                  role: AdminRole.PRODUCT_MANAGER,
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterAdmins;

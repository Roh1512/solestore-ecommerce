import { OrderStatus } from "@/client";
import { closeModal, openModal } from "@/utils/modal_utils";
import { ListFilterPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  updateParams: (newParams: {
    page?: number;
    order_status?: OrderStatus;
  }) => void;
  order_status?: OrderStatus;
};

const FilterOrders = ({ updateParams, order_status }: Props) => {
  const modalId = "filter-order-modal";
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<
    OrderStatus | ""
  >(order_status || "");

  const close = useCallback(() => {
    closeModal(modalId);
  }, []);

  const open = useCallback(() => {
    openModal(modalId);
  }, []);

  const handleApplyFilters = () => {
    updateParams({
      order_status:
        selectedOrderStatus !== "" ? selectedOrderStatus : undefined,
      page: 1,
    });
    toast.success("Filters applied successfully");
    close();
  };

  const clearFilters = useCallback(() => {
    setSelectedOrderStatus("");
    updateParams({
      order_status: undefined,
      page: 1,
    });
    toast.success("Filters cleared successfully");
    close();
  }, [close, updateParams]);

  return (
    <>
      <button
        className="btn btn-primary text-lg flex items-center gap-2"
        onClick={open}
        aria-label="Open filter options"
      >
        <ListFilterPlus aria-hidden="true" />
        <span>Filter</span>
      </button>

      <dialog
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
        role="dialog"
        aria-labelledby="filter-modal-title"
      >
        <div className="modal-box">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
            aria-label="Close filter modal"
          >
            ✕
          </button>

          <h3 id="filter-modal-title" className="font-bold text-lg mb-4">
            Filter Orders
          </h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Order Status</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedOrderStatus}
              onChange={(e) =>
                setSelectedOrderStatus(e.target.value as OrderStatus | "")
              }
            >
              <option value="" defaultChecked>
                All
              </option>
              <option value="REQUESTED">Requested</option>
              <option value="SHIPPED">Shipped</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          <div className="modal-action mt-6">
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default FilterOrders;

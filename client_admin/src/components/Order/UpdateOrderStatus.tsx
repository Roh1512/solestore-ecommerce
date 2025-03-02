import { OrderResponse, OrderStatus } from "@/client";
import { useUpdateOrderStatusMutation } from "@/features/orderApiSlice";
import { useCallback, useState } from "react";
import { Dot, Loader2 } from "lucide-react";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { toast } from "react-toastify";

type Props = {
  order: OrderResponse;
};

const UpdateOrderStatus = ({ order }: Props) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const orderStatus = order.order_status!;
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(orderStatus);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (selectedStatus === orderStatus) return;
      try {
        await updateOrderStatus({
          orderId: order.id,
          orderStatus: selectedStatus,
        }).unwrap();
        toast.success("Order status updated");
      } catch (err) {
        console.error("Failed to update order status:", err);
        if (isApiError(err)) {
          const errorMessage = getApiErrorMessage(err);
          toast.error(errorMessage || "Error updating status");
        }
      }
    },
    [order.id, orderStatus, selectedStatus, updateOrderStatus]
  );

  const statusColors: Record<OrderStatus, string> = {
    REQUESTED: "badge-warning",
    PROCESSING: "badge-info",
    SHIPPED: "badge-primary",
    DELIVERED: "badge-success",
  };

  return (
    <div className="form-control bg-base-200 pt-2 w-full">
      <h3 className="mb-3">Update Order</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row flex-wrap items-center justify-center gap-4"
      >
        <label className="label">
          <span className="label-text"></span>
        </label>
        <select
          className="select select-bordered"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
        >
          {(
            ["REQUESTED", "PROCESSING", "SHIPPED", "DELIVERED"] as OrderStatus[]
          ).map((status) => (
            <option key={status} value={status} defaultValue={selectedStatus}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={`btn ${isLoading ? "btn-disabled" : "btn-neutral"}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </button>
      </form>
      <div className="mt-2">
        <span className={`badge ${statusColors[orderStatus]}`}>
          <Dot className="w-9 h-9" />
          {orderStatus}
        </span>
      </div>
    </div>
  );
};

export default UpdateOrderStatus;

import { OrderResponse, OrderStatus } from "@/client";
import { format } from "date-fns";
import { Check, Dot, IndianRupee, X } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  order: OrderResponse;
};

const OrderCard = ({ order }: Props) => {
  const formattedDate = order.created_at
    ? format(new Date(order.created_at), "MMMM d yyyy")
    : "N/A";

  const statusColors: Record<OrderStatus, string> = {
    REQUESTED: "badge-warning",
    PROCESSING: "badge-info",
    SHIPPED: "badge-primary",
    DELIVERED: "badge-success",
  };

  return (
    <div className="card flex p-0 flex-col bg-base-200 shadow-lg border border-base-200">
      <div className="card-body p-0 ">
        <div className="card-title m-0 w-full p-2 bg-base-300 rounded-t-box">
          <span className={`badge ${statusColors[order.order_status!]}`}>
            <Dot className="w-9 h-9" />
            {order.order_status}
          </span>
        </div>
        <div className="w-full p-4 mb-4 gap-4">
          {/* Header with Order ID and Status */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div className="text-sm flex flex-col items-start">
              <p className="text-sm">Order ID</p>
              <p className="text-lg font-semibold">{order.id}</p>
            </div>
          </div>

          {/* Payment and Item Summary */}
          <div className="flex flex-row justify-center items-center gap-2 p-0 m-0">
            <div className="flex flex-col">
              <p className="text-sm">Quantity</p>
              <p className="text-lg font-semibold">
                {order.order_details.total_count}
              </p>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="flex flex-col">
              <p className="text-sm">Order Date</p>
              <p className="text-md font-semibold">{formattedDate}</p>
            </div>
          </div>

          <div className="divider m-0"></div>

          <div className="flex flex-wrap items-center justify-center mx-auto gap-4">
            <div className="flex gap-2 w-fit">
              <p className="text-sm">Payment</p>{" "}
              <span
                className={`badge flex items-center justify-center gap-2 ${
                  order.payment_verified ? `badge-success` : "badge-error"
                }`}
              >
                {order.payment_verified ? (
                  <>
                    <Check aria-hidden className="w-5 h-5" /> Verified
                  </>
                ) : (
                  <>
                    <X aria-hidden className="w-5 h-5" /> Not Verified
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col mt-2">
              <p className="text-sm text-secondary">Total Amount</p>
              <p className="flex flex-row gap-2 text-xl font-semibold items-center justify-center">
                <IndianRupee /> {order.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="card-actions bg-base-300 p-4 w-full rounded-b-box">
          <Link
            to={`/admin/orders/${order.id}`}
            className="btn btn-primary w-full"
          >
            View Order Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

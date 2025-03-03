import { OrderResponse, OrderStatus } from "@/client";
import BackButton from "@/components/Buttons/BackButton";
import ButtonLoading from "@/components/Loading/ButtonLoading";
import PageLoading from "@/components/Loading/PageLoading";
import UpdateOrderStatus from "@/components/Order/UpdateOrderStatus";
import {
  useCancelHandlingOrderMutation,
  useGetOrderQuery,
  useStartHandlingOrderMutation,
} from "@/features/orderApiSlice";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { Check, Dot, X } from "lucide-react";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetProfileQuery } from "@/features/profileApiSLice";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { data: order, isLoading } = useGetOrderQuery({ orderId: orderId! });
  console.log(order);
  const { data: currentAdmin } = useGetProfileQuery();

  const [startProcessing, { isLoading: startProcessingLoading }] =
    useStartHandlingOrderMutation();
  const [cancelProcessing, { isLoading: cancelProcessingLoading }] =
    useCancelHandlingOrderMutation();

  const handleStartProcessing = useCallback(async () => {
    try {
      if (!order) {
        return;
      }
      await startProcessing({ orderId: order?.id }).unwrap();
    } catch (error) {
      console.error(error);
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage || "Error processing order.");
      }
    }
  }, [order, startProcessing]);

  const handleCancelProcessing = useCallback(async () => {
    try {
      if (!order) {
        return;
      }
      await cancelProcessing({
        orderId: order.id,
      }).unwrap();
    } catch (error) {
      console.error(error);
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage || "Error processing order.");
      }
    }
  }, [cancelProcessing, order]);

  const statusColors: Record<OrderStatus, string> = {
    REQUESTED: "badge-warning",
    PROCESSING: "badge-info",
    SHIPPED: "badge-primary",
    DELIVERED: "badge-success",
  };

  const isProcessingByYou: boolean =
    currentAdmin?._id === order?.processing_admin &&
    order?.order_status === "PROCESSING";
  const isProcessingBySomeoneElse: boolean =
    currentAdmin?._id !== order?.processing_admin &&
    order?.order_status === "PROCESSING";

  if (isLoading) {
    return <PageLoading />;
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="w-full flex items-stretch justify-between">
        <BackButton />
        {!isProcessingByYou && !isProcessingBySomeoneElse && (
          <button
            className="btn btn-success"
            onClick={handleStartProcessing}
            disabled={startProcessingLoading}
          >
            {startProcessingLoading ? (
              <ButtonLoading text="Loading" />
            ) : (
              "Start handling this order"
            )}
          </button>
        )}
        {isProcessingByYou && (
          <button
            className="btn btn-error"
            onClick={handleCancelProcessing}
            disabled={cancelProcessingLoading}
          >
            {cancelProcessingLoading ? (
              <ButtonLoading text="Loading" />
            ) : (
              "Cancel handling this order"
            )}
          </button>
        )}
      </div>
      {isProcessingByYou && <UpdateOrderStatus order={order} />}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Order Details</h2>
          <div className="space-y-2 text-start">
            <p>
              <span className="font-bold">ID:</span>{" "}
              <span className="badge badge-primary badge-outline">
                {order.id}
              </span>
            </p>
            <p className="flex items-center gap-3">
              <span className="font-bold">Status:</span>{" "}
              <span
                className={`badge ${
                  statusColors[order.order_status as OrderStatus]
                }`}
              >
                <Dot className="w-9 h-9" />
                {order.order_status}
              </span>
            </p>
            <p className="flex items-center gap-3">
              <span className="font-bold">Payment:</span>{" "}
              {order.payment_verified ? (
                <span className="badge badge-success rounded-sm flex items-center justify-center gap-2">
                  <Check />
                  Verified
                </span>
              ) : (
                <span className="badge badge-wrong rounded-sm flex items-center justify-center gap-2">
                  <X />
                  Pending
                </span>
              )}
            </p>
            <p>
              <span className="font-bold">Amount:</span> ₹{order.amount}
            </p>
            <p>
              <span className="font-bold">Razorpay Order ID:</span>{" "}
              {order.razorpay_order_id}
            </p>
            <p>
              <span className="font-bold">Razorpay Payment ID:</span>{" "}
              {order.razorpay_payment_id}
            </p>
            <p>
              <span className="font-bold">Created At:</span>{" "}
              {new Date(order.created_at!).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Updated At:</span>{" "}
              {new Date(order.updated_at!).toLocaleString()}
            </p>
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-semibold">Delivery Details</h3>

          <div>
            <p>
              <span className="font-bold">Name:</span> {order.user.name}
            </p>
            <p>
              <span className="font-bold">Address:</span> {order.address}
            </p>
            <p>
              <span className="font-bold">Phone:</span> {order.phone}
            </p>
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-semibold">Products</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {(order as OrderResponse).order_details.items.map(
                  (item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 rounded">
                            <img src={item.image_url!} alt={item.title} />
                          </div>
                        </div>
                      </td>
                      <td>{item.title}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{item.size}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <p>
              <span className="font-bold">Total Count:</span>{" "}
              {order.order_details.total_count}
            </p>
            <p>
              <span className="font-bold">Total Price:</span> ₹
              {order.order_details.total_price}
            </p>
          </div>
        </div>
      </div>
      {isProcessingByYou && <UpdateOrderStatus order={order} />}
    </div>
  );
};

export default OrderDetail;

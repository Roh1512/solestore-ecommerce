import { OrderStatus } from "@/client";
import OrdersLoading from "@/components/Loading/OrdersLoading";
import PageLoading from "@/components/Loading/PageLoading";
import FilterOrders from "@/components/Order/FilterOrders";
import OrderCard from "@/components/Order/OrderCard";
import { useGetOrdersQuery } from "@/features/orderApiSlice";
import { getApiErrorMessage, isApiError } from "@/utils/errorHandler";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = parseInt(pageFromQuery) || 1;
  const order_status = searchParams.get("order_status") || "";

  const updateParams = useCallback(
    (newParams: {
      page?: number;
      order_status?: OrderStatus;
      search_id?: string;
    }) => {
      // Create a fresh instance from window.location.search
      const currentParams = new URLSearchParams(window.location.search);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value.toString() !== "") {
          currentParams.set(
            key,
            typeof value === "number" ? value.toString() : value
          );
        } else {
          currentParams.delete(key);
        }
      });
      setSearchParams(currentParams);
    },
    [setSearchParams]
  );

  const handleNextPage = useCallback(() => {
    updateParams({ page: page + 1 });
  }, [page, updateParams]);

  const handlePreviousPage = useCallback(() => {
    // Ensure page doesn't go below 1
    if (page !== 1) {
      updateParams({ page: page - 1 });
    }
    return;
  }, [page, updateParams]);

  const {
    data: orders,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetOrdersQuery({
    page: page,
    order_status: (order_status as OrderStatus) || "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // useRef to store the previous page value
  const prevPageRef = useRef(page);
  // Condition: show loading indicator only if we're refetching due to a page change
  const isPageRefetching = isFetching && page !== prevPageRef.current;

  useEffect(() => {
    if (isError && error) {
      if (isApiError(error)) {
        const errorMessage = getApiErrorMessage(error);
        if (typeof errorMessage === "string") {
          toast.error(errorMessage);
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    }
  }, [error, isError]);

  if (isLoading) return <PageLoading />;

  return (
    <div
      className="p-2 flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <h2 className="text-xl font-semibold">Orders</h2>
      <div className="flex items-center justify-center gap-2">
        <FilterOrders
          updateParams={updateParams}
          order_status={order_status as OrderStatus}
        />
        <button className="btn btn-neutral">Search Order By ID</button>
      </div>

      <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:grid-cols-3 flex-1 items-center justify-center mx-auto">
        {isPageRefetching ? (
          <OrdersLoading />
        ) : (
          orders &&
          orders?.map((order) => <OrderCard order={order} key={order.id} />)
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1 || isLoading}
          className="btn btn-sm btn-ghost"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="flex items-center px-4 py-2 bg-base-200 rounded-lg">
          Page {page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={(orders && orders.length < 20) /* Limit */ || isLoading} // Disable if fewer items are returned than the limit
          className="btn btn-sm btn-ghost"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrdersPage;

import OrdersLoading from "@/components/Loading/OrdersLoading";
import PageLoading from "@/components/Loading/PageLoading";
import OrderCard from "@/components/Order/OrderCard";
import { useGetOrdersQuery } from "@/features/orderApiSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = parseInt(pageFromQuery) || 1;

  const updateParams = useCallback(
    (newParams: { page?: number }) => {
      const updatedParams = new URLSearchParams(searchParams);
      if (newParams.page) updatedParams.set("page", String(newParams.page));
      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams]
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
  } = useGetOrdersQuery({
    page: page,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // useRef to store the previous page value
  const prevPageRef = useRef(page);
  // Condition: show loading indicator only if we're refetching due to a page change
  const isPageRefetching = isFetching && page !== prevPageRef.current;

  if (isLoading) return <PageLoading />;

  return (
    <div
      className="p-2 flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <h2 className="text-xl font-semibold">Orders</h2>

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

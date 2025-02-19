import CheckoutButton from "@/components/Buttons/CheckOutButton";
import CartItemCard from "@/components/Cart/CartItemCard";
import { useGetCartQuery } from "@/features/cartApiSlice";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const CartPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = parseInt(pageFromQuery) || 1;
  const searchTerm = searchParams.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(searchTerm || "");

  const updateParams = useCallback(
    (newParams: { search?: string; page?: number }) => {
      const updatedParams = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Convert numbers to strings if necessary.
          updatedParams.set(
            key,
            typeof value === "number" ? value.toString() : value
          );
        } else {
          updatedParams.delete(key);
        }
        if (newParams.page) updatedParams.set("page", String(newParams.page));
        if (newParams.search) updatedParams.set("search", newParams.search);
      });
    },
    [searchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set("search", searchQuery);
      setSearchParams(updatedParams);
    }, 1500);
    return () => clearTimeout(handler);
  }, [searchParams, searchQuery, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Handle next page
  const handleNextPage = useCallback(() => {
    updateParams({ page: page + 1 });
  }, [page, updateParams]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    // Ensure page doesn't go below 1
    if (page !== 1) {
      updateParams({ page: page - 1 });
    }
    return;
  }, [page, updateParams]);

  const { data: cartResponse } = useGetCartQuery({
    page: page,
    search: searchTerm || "",
  });

  return (
    <div
      className="p-2 bg-transparent flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <div className="flex items-center justify-center flex-wrap">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search cart items"
            aria-label="Search cart items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-6 h-6" />
        </label>
      </div>
      <div>
        <p>Total Price: {cartResponse?.total_price}</p>
        <p>Total Items: {cartResponse?.total_count}</p>
      </div>
      <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-10 xl:grid-cols-3 flex-1 items-center justify-center mx-auto">
        {cartResponse?.items.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {cartResponse && <CheckoutButton amount={cartResponse?.total_price} />}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
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
          disabled={
            cartResponse?.items && cartResponse.items.length < 20 /* Limit */
          } // Disable if fewer items are returned than the limit
          className="btn btn-sm btn-ghost"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartPage;

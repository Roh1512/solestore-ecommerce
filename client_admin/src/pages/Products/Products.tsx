import PageLoading from "@/components/Loading/PageLoading";
import ProductsLoading from "@/components/Loading/ProductsLoading";
import ProductCard from "@/components/Products/ProductCard";
import { useGetProductsQuery } from "@/features/productApiSlice";
import { SortByProduct, SortOrder } from "@/types/queryTypes";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = Number(pageFromQuery) || 1;

  const validSortByValues = Object.values(SortByProduct);
  const sortByParam = searchParams.get("sortBy");
  const sortBy = validSortByValues.includes(sortByParam as SortByProduct)
    ? (sortByParam as SortByProduct)
    : SortByProduct.DATE;

  const validSortOrderValues = Object.values(SortOrder);
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder = validSortOrderValues.includes(sortOrderParam as SortOrder)
    ? (sortOrderParam as SortOrder)
    : SortOrder.Asc;

  const size = Number(searchParams.get("size"));
  const brand = searchParams.get("brand") || undefined;
  const category = searchParams.get("category") || undefined;

  const searchTerm = searchParams.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(searchTerm || "");

  const updateParams = useCallback(
    (newParams: {
      search?: string;
      page?: string;
      sortBy?: string;
      sortOrder?: string;
      size?: string;
      category?: string;
      brand?: string;
    }) => {
      const updatedParams = new URLSearchParams(searchParams);

      if (newParams.page) updatedParams.set("page", newParams.page);
      if (newParams.sortBy) updatedParams.set("sortBy", newParams.sortBy);
      if (newParams.sortOrder)
        updatedParams.set("sortOrder", newParams.sortOrder);

      if (newParams.size) updatedParams.set("size", newParams.size);
      if (newParams.brand) updatedParams.set("brand", newParams.brand);
      if (newParams.category) updatedParams.set("category", newParams.category);
      if (newParams.search) updatedParams.set("search", newParams.search);
      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set("search", searchQuery);
      setSearchParams(updatedParams);
    });
    return () => clearTimeout(handler);
  }, [searchParams, searchQuery, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const {
    data: products,
    isLoading,
    isFetching,
  } = useGetProductsQuery({
    search: searchTerm || "",
    page: page,
    sort_by: sortBy,
    sort_order: sortOrder,
    size: size,
    brand: brand || undefined,
    category: category,
  });

  // Handle next page
  const handleNextPage = useCallback(() => {
    updateParams({ page: (page + 1).toString() });
  }, [page, updateParams]);

  // Handle previous page
  const handlePreviousPage = useCallback(() => {
    // Ensure page doesn't go below 1
    if (page !== 1) {
      updateParams({ page: (page - 1).toString() });
    }
    return;
  }, [page, updateParams]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div
      className="p-2 bg-base-100 flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <h3 className="text-3xl font-bold text-center mb-8">Products</h3>

      <label className="input input-bordered flex items-center gap-2">
        <input
          type="text"
          className="grow"
          placeholder="Search categories"
          aria-label="Search categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="w-6 h-6" />
      </label>

      {isFetching ? (
        <div className="w-full">
          <ProductsLoading />
        </div>
      ) : (
        <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-10 xl:grid-cols-3 flex-1">
          {products &&
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      )}

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
          disabled={products && products?.length < 15 /* Limit */} // Disable if fewer items are returned than the limit
          className="btn btn-sm btn-ghost"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Products;

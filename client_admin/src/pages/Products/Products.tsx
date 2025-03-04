import FilterProducts from "@/components/DropDowns/FilterProducts";
import SortProducts from "@/components/DropDowns/SortProducts";
import PageLoading from "@/components/Loading/PageLoading";
import ProductsLoading from "@/components/Loading/ProductsLoading";
import ProductCard from "@/components/Products/ProductCard";
import { useGetProductsQuery } from "@/features/productApiSlice";
import { SortByProduct, SortOrder } from "@/types/queryTypes";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const updateParams = useCallback(
    (newParams: {
      page?: string;
      sortBy?: string;
      sortOrder?: string;
      size?: number;
      category?: string;
      brand?: string;
    }) => {
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
      });

      if (newParams.page) updatedParams.set("page", newParams.page);
      if (newParams.sortBy) updatedParams.set("sortBy", newParams.sortBy);
      if (newParams.sortOrder)
        updatedParams.set("sortOrder", newParams.sortOrder);

      if (newParams.size) updatedParams.set("size", String(newParams.size));
      if (newParams.brand) updatedParams.set("brand", newParams.brand);
      if (newParams.category) updatedParams.set("category", newParams.category);
      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (searchQuery === "") {
      setDebouncedSearch("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const {
    data: products,
    isLoading,
    isFetching,
  } = useGetProductsQuery({
    search: debouncedSearch || "",
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

      <div className="flex items-center justify-center flex-wrap">
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
        <div className="flex items-center justify-center">
          <SortProducts
            updateParams={updateParams}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <FilterProducts
            updateParams={updateParams}
            category={category}
            brand={brand}
            size={size}
          />
          <Link
            to="/admin/products/add"
            className="btn bg-green-900 hover:bg-green-700 shadow-slate-700 shadow-md text-white fixed bottom-7 right-6 text-lg font-bold z-10"
          >
            Add Product
          </Link>
        </div>
      </div>

      {isFetching ? (
        <div className="w-full">
          <ProductsLoading />
        </div>
      ) : (
        <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-10 xl:grid-cols-3 flex-1 items-center justify-center">
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

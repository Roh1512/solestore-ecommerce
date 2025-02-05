import AddCategory from "@/components/Categories/AddCategory";
import Category from "@/components/Categories/Category";
import PageLoading from "@/components/Loading/PageLoading";
import Sort from "@/components/DropDowns/Sort";
import { useGetCategoriesQuery } from "@/features/categoryApiSlice";
import { SortBy, SortOrder } from "@/types/queryTypes";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const CategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = Number(pageFromQuery) || 1;

  const validSortByValues = Object.values(SortBy);
  const sortByParam = searchParams.get("sortBy");
  const sortBy = validSortByValues.includes(sortByParam as SortBy)
    ? (sortByParam as SortBy)
    : SortBy.Title;
  const validSortOrderValues = Object.values(SortOrder);
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder = validSortOrderValues.includes(sortOrderParam as SortOrder)
    ? (sortOrderParam as SortOrder)
    : SortOrder.Asc;
  const limit = 10;

  const updateParams = useCallback(
    (newParams: { page?: string; sortBy?: string; sortOrder?: string }) => {
      const updatedParams = new URLSearchParams(searchParams);

      if (newParams.page) updatedParams.set("page", newParams.page);
      if (newParams.sortBy) updatedParams.set("sortBy", newParams.sortBy);
      if (newParams.sortOrder)
        updatedParams.set("sortOrder", newParams.sortOrder);

      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams]
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce effect: Update debouncedSearch after a delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Adjust the debounce delay as needed (e.g., 500ms)

    return () => {
      clearTimeout(handler); // Clear timeout if searchQuery changes before delay is complete
    };
  }, [searchQuery]);

  const { data: categories, isLoading } = useGetCategoriesQuery({
    search: debouncedSearch || "",
    skip: (page - 1) * limit, // Calculate skip based on current page
    limit: limit,
    sort_by: sortBy || SortBy.Title,
    sort_order: sortOrder,
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
      className="p-6 bg-base-100 flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <h3 className="text-3xl font-bold text-center mb-8">Categories</h3>
      <div className="flex items-center justify-center">
        <label className="input input-bordered flex items-center">
          <input
            type="text"
            className="grow"
            placeholder="Search brands"
            aria-label="Search brands"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-6 h-6" />
        </label>
        <Sort updateParams={updateParams} />
        <AddCategory />
      </div>
      <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-7 lg:grid-cols-3 flex-1">
        {categories &&
          categories.map((category) => (
            <Category category={category} key={category.id} />
          ))}
      </div>

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
          disabled={categories && categories?.length < limit} // Disable if fewer items are returned than the limit
          className="btn btn-sm btn-ghost"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesPage;

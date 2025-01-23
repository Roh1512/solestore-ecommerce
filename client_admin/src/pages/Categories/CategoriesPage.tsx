import AddCategory from "@/components/Categories/AddCategory";
import Category from "@/components/Categories/Category";
import PageLoading from "@/components/Loading/PageLoading";
import { useGetCategoriesQuery } from "@/features/categoryApiSlice";
import { SortBy, SortOrder } from "@/types/queryTypes";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

const CategoriesPage = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 10;

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
    sort_by: SortBy.Title,
    sort_order: SortOrder.Asc,
  });

  if (isLoading) {
    return <PageLoading />;
  }

  // Handle next page
  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Handle previous page
  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1)); // Ensure page doesn't go below 1
  };

  return (
    <div
      className="p-6 bg-base-100 flex flex-col items-center justify-between gap-4"
      style={{ minHeight: "80vh" }}
    >
      <div className="">
        <h3 className="text-3xl font-bold text-center mb-8">Categories</h3>
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

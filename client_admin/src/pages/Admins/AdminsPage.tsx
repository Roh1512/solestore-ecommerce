import AddAdmin from "@/components/Admins/AddAdmin";
import AdminCard from "@/components/Admins/AdminCard";
import FilterAdmins from "@/components/Admins/FilterAdmins";
import SortAdmins from "@/components/Admins/SortAdmins";
import PageLoading from "@/components/Loading/PageLoading";
import { useGetAdminsQuery } from "@/features/allAdminsApiSlice";
import { AdminRole, SortByAdmin, SortOrder } from "@/types/queryTypes";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AdminsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";
  const page = Number(pageFromQuery) || 1;
  const limit = 10; // Number of items per page

  const validSortByValues = Object.values(SortByAdmin);
  const sortByParam = searchParams.get("sortBy");
  const sortBy: SortByAdmin = validSortByValues.includes(
    sortByParam as SortByAdmin
  )
    ? (sortByParam as SortByAdmin)
    : SortByAdmin.date;

  const validSortOrderValues = Object.values(SortOrder);
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder = validSortOrderValues.includes(sortOrderParam as SortOrder)
    ? (sortOrderParam as SortOrder)
    : SortOrder.Desc;

  const validRoles = Object.values(AdminRole);
  const roleParam = searchParams.get("role");
  const role = validRoles.includes(roleParam as AdminRole)
    ? (roleParam as AdminRole)
    : null;

  const updateParams = useCallback(
    (newParams: {
      page?: string;
      sortBy?: string;
      sortOrder?: string;
      role?: string;
    }) => {
      const updatedParams = new URLSearchParams(searchParams);

      if (newParams.page) updatedParams.set("page", newParams.page);
      if (newParams.sortBy)
        updatedParams.set("sortBy", newParams.sortBy as SortByAdmin);
      if (newParams.sortOrder)
        updatedParams.set("sortOrder", newParams.sortOrder as SortOrder);
      if (newParams.role) updatedParams.set("role", newParams.role);

      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams]
  );

  const removeParam = useCallback(
    (param: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(param);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Adjust the debounce delay as needed (e.g., 500ms)

    return () => {
      clearTimeout(handler); // Clear timeout if searchQuery changes before delay is complete
    };
  }, [searchQuery]);

  const { data: admins, isLoading } = useGetAdminsQuery({
    search: debouncedSearch || "",
    skip: (page - 1) * limit,
    limit: limit,
    sort_by: sortBy || SortByAdmin.date,
    sort_order: sortOrder || SortOrder.Desc,
    role: role || undefined,
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
      <h3 className="text-3xl font-bold text-center mb-8">Admins</h3>
      <div className="flex items-center justify-center">
        <AddAdmin />
        <label className="input input-bordered flex items-center">
          <input
            type="text"
            className="grow"
            placeholder="Search Admins"
            aria-label="Search admins"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-6 h-6" />
        </label>
      </div>
      <div className="w-full max-w-96 flex items-center justify-between">
        <SortAdmins
          updateParams={updateParams}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <FilterAdmins
          updateParams={updateParams}
          removeParam={removeParam}
          role={role}
        />
      </div>
      <div className="overflow-x-auto grid sm:grid-cols-1 md:grid-cols-2 gap-7 lg:grid-cols-3 flex-1">
        {admins &&
          admins?.map((admin) => <AdminCard admin={admin} key={admin._id} />)}
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
          disabled={admins && admins?.length < limit} // Disable if fewer items are returned than the limit
          className="btn btn-sm btn-ghost"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminsPage;

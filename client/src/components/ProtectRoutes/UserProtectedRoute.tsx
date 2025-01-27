import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useCheckAuthQuery } from "@/features/userAuthApiSlice";

import HeaderStore from "../headersAndFooters/headers/headersStore/HeaderStore";
import FooterStore from "../headersAndFooters/footersStore/FooterStore";
import PageLoading from "../Loading/PageLoading";

const UserProtectedRoute = () => {
  const location = useLocation();

  const { isError: isAuthError, isLoading: isAuthLoading } = useCheckAuthQuery(
    undefined,
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  if (isAuthLoading) {
    return <PageLoading />;
  }

  if (isAuthError) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <HeaderStore />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterStore />
    </>
  );
};

export default UserProtectedRoute;

/* if (isLoadingState && (isAuthLoading || isRefreshing)) {
  return <PageLoading />;
}

if (isAuthError && refreshFailed) {
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

return (
  <>
    <HeaderStore />
    <main className="flex-1">
      <Outlet />
    </main>
    <FooterStore />
  </>
); */

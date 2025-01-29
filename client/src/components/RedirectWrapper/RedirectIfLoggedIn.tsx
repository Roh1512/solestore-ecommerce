import { Navigate, Outlet } from "react-router";
import { useCheckAuthQuery } from "@/features/userAuthApiSlice";
import PageLoading from "../Loading/PageLoading";
import { Suspense } from "react";
import { ErrorBoundary } from "../ErrorElements/ErrorBoundary";

const RedirectIfLoggedIn = () => {
  const {
    data: authData,
    isError: isAuthError,
    isLoading: isAuthLoading,
    isSuccess: isAuthSuccess,
  } = useCheckAuthQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  if (isAuthLoading) {
    return <PageLoading />;
  }

  if (isAuthError || (isAuthSuccess && authData?.status !== "authenticated")) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isAuthSuccess && authData?.status === "authenticated") {
    return <Navigate to="/shop" replace />;
  }

  return null;
};

export default RedirectIfLoggedIn;

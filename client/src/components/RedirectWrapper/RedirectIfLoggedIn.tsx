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

  if (isAuthError) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isAuthSuccess) {
    if (authData?.status === "authenticated") {
      return <Navigate to="/shop" replace />;
    }
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return <PageLoading />;
};

export default RedirectIfLoggedIn;

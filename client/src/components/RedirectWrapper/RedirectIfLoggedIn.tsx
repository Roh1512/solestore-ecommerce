import { Navigate, Outlet } from "react-router";
import { useCheckAuthQuery } from "@/features/userAuthApiSlice";
import PageLoading from "../Loading/PageLoading";

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
      <main className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </main>
    );
  }

  if (isAuthSuccess && authData?.status === "authenticated") {
    return <Navigate to="/shop" replace />;
  }

  return null;
};

export default RedirectIfLoggedIn;

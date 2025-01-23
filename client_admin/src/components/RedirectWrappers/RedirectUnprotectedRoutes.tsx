import { Navigate, Outlet } from "react-router-dom";
import HeaderAdmin from "../Headers/HeaderAdmin";
import FooterAdmin from "../Footers/FooterAdmin";
import { useCurrentState } from "@/app/useCurrentState";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/adminAuthApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { useEffect, useState } from "react";
import { setCredentials } from "@/features/adminAuthSlice";
import PageLoading from "../Loading/PageLoading";
import { isTokenExpired } from "@/types/tokenUtils";

const RedirectUnprotectedRoutes = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, accessToken } = useCurrentState().auth;

  const {
    data: authData,
    isError: isAuthError,
    isLoading: isAuthLoading,
  } = useCheckAuthQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [refreshToken, { isLoading: isRefreshing }] = useRefreshTokenMutation();

  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState<boolean>(false); // Prevent infinite retries
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);

  useEffect(() => {
    const refreshAuthToken = async () => {
      try {
        setIsLoadingState(true);
        setRefreshing(true);
        const tokenResponse = await refreshToken().unwrap();
        dispatch(setCredentials({ accessToken: tokenResponse.access_token }));
        setRefreshFailed(false);
      } catch (error) {
        console.error("Token refresh failed:", error);
        setRefreshFailed(true);
      } finally {
        setRefreshing(false);
        setIsLoadingState(false);
      }
    };

    // Check if the token is expired
    if (accessToken && isTokenExpired(accessToken)) {
      console.log("Token is expired, attempting to refresh...");
      refreshAuthToken();
    }

    // Handle auth error (e.g., token is invalid or missing)
    if (isAuthError && !refreshing && !refreshFailed && isLoggedIn) {
      console.log("Auth error detected, attempting to refresh token...");
      refreshAuthToken();
    }
  }, [
    dispatch,
    isAuthError,
    isLoggedIn,
    refreshFailed,
    refreshToken,
    refreshing,
    accessToken, // Add accessToken to dependency array
  ]);

  if (isLoadingState && (isAuthLoading || refreshing || isRefreshing)) {
    return <PageLoading />;
  }

  if (!isAuthError && refreshFailed) {
    return (
      <>
        <HeaderAdmin />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </main>
        <FooterAdmin />
      </>
    );
  }

  if (authData?.status === "authenticated" && authData.admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      <HeaderAdmin />
      <main className="flex flex-col items-center justify-center">
        <Outlet />
      </main>
      <FooterAdmin />
    </>
  );
};

export default RedirectUnprotectedRoutes;

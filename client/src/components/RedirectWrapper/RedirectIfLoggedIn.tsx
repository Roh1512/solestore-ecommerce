import { Navigate, Outlet } from "react-router";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";
import PageLoading from "../Loading/PageLoading";
import { isTokenExpired } from "@/utils/tokenUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

const RedirectIfLoggedIn = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

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
        <main className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </main>
      </>
    );
  }

  if (authData?.status === "authenticated" && authData.user) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <Outlet />
      </main>
    </>
  );
};

export default RedirectIfLoggedIn;

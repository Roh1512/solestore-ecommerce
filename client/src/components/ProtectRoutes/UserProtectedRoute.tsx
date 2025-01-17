import { Outlet, useLocation, Navigate } from "react-router-dom";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import HeaderStore from "../headersAndFooters/headers/headersStore/HeaderStore";
import FooterStore from "../headersAndFooters/footersStore/FooterStore";
import PageLoading from "../Loading/PageLoading";

const UserProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const { isError: isAuthError, isLoading: isAuthLoading } = useCheckAuthQuery(
    undefined,
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const [refreshToken, { isLoading: isRefreshing }] = useRefreshTokenMutation();

  const [refreshFailed, setRefreshFailed] = useState<boolean>(false);

  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);

  useEffect(() => {
    const refreshAuthToken = async () => {
      try {
        setIsLoadingState(true);
        const tokenResponse = await refreshToken().unwrap();
        dispatch(setCredentials({ accessToken: tokenResponse.access_token }));
        setRefreshFailed(false);
      } catch (error) {
        console.error("Token refresh failed:", error);
        setRefreshFailed(true);
      } finally {
        setIsLoadingState(false);
      }
    };

    if (isAuthError && !refreshFailed && isLoggedIn && !isRefreshing) {
      refreshAuthToken(); // Only refresh if not already redirecting
    }
  }, [
    dispatch,
    isAuthError,
    refreshFailed,
    refreshToken,
    isLoggedIn,
    isRefreshing,
  ]);

  if (isLoadingState && (isAuthLoading || isRefreshing)) {
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
  );
};

export default UserProtectedRoute;

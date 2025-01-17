import { Navigate, Outlet } from "react-router";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";
import PageLoading from "../Loading/PageLoading";

const RedirectIfLoggedIn = () => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const { data, isLoading, isError } = useCheckAuthQuery(undefined, {
    skip: false, // Ensure the query runs on mount
  });
  const [refreshToken] = useRefreshTokenMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState<boolean>(false); // Prevent infinite retries
  const dispatch = useAppDispatch();

  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);

  useEffect(() => {
    const handleTokenRefresh = async () => {
      try {
        setIsLoadingState(true);
        setRefreshing(true);
        const tokenResponse = await refreshToken().unwrap();
        dispatch(setCredentials({ accessToken: tokenResponse.access_token }));
      } catch (error) {
        console.error("Token refresh failed:", error);
        setRefreshFailed(true); // Prevent further retries
      } finally {
        setRefreshing(false);
        setIsLoadingState(false);
      }
    };

    if (isError && !refreshing && !refreshFailed && isLoggedIn) {
      handleTokenRefresh();
    }
  }, [isError, refreshing, refreshFailed, refreshToken, dispatch, isLoggedIn]);

  if ((isLoadingState && isLoading) || refreshing) {
    return <PageLoading />;
  }

  if (isError && refreshFailed) {
    // If refreshing failed, stop trying and let the user proceed to public routes
    return (
      <>
        <Outlet />
      </>
    );
  }

  if (data?.status === "authenticated" && data.user) {
    // If the user is authenticated, redirect to "/shop"
    return <Navigate to="/shop" replace />;
  }

  // If the user is not logged in, render the intended component
  return (
    <>
      <Outlet />
    </>
  );
};

export default RedirectIfLoggedIn;

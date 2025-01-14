import { Navigate, Outlet } from "react-router";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice";

const RedirectIfLoggedIn = () => {
  const { data, isLoading, isError, refetch } = useCheckAuthQuery(undefined, {
    skip: false, // Ensure the query runs on mount
  });
  const [refreshToken] = useRefreshTokenMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false); // Prevent infinite retries
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleTokenRefresh = async () => {
      try {
        setRefreshing(true);
        const tokenResponse = await refreshToken().unwrap();
        dispatch(setCredentials({ accessToken: tokenResponse.access_token }));
        refetch(); // Refetch `/checkauth` after refreshing the token
      } catch (error) {
        console.error("Token refresh failed:", error);
        setRefreshFailed(true); // Stop further retries
      } finally {
        setRefreshing(false);
      }
    };

    if (isError && !refreshing && !refreshFailed) {
      handleTokenRefresh();
    }
  }, [isError, refreshing, refreshFailed, refreshToken, dispatch, refetch]);

  if (isLoading || refreshing) {
    // Optional: Show a loader while checking auth status or refreshing the token
    return <p>Loading...</p>;
  }

  if (refreshFailed) {
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

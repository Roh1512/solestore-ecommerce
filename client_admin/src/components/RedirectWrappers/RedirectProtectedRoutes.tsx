import { useAppDispatch } from "@/app/hooks";
import { useCurrentState } from "@/app/useCurrentState";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/adminAuthApiSlice";
import { clearCredentials, setCredentials } from "@/features/adminAuthSlice";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RedirectProtectedRoutes = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isLoggedIn } = useCurrentState().auth;

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
        console.error("Token refresh failed: ", error);
        dispatch(clearCredentials());
        setRefreshFailed(true);
      } finally {
        setIsLoadingState(false);
      }
    };
    if (isAuthError && !refreshFailed && isLoggedIn && !isRefreshing) {
      refreshAuthToken();
    }
  }, [
    dispatch,
    isAuthError,
    isLoggedIn,
    isRefreshing,
    refreshFailed,
    refreshToken,
  ]);

  if (isLoadingState && (isAuthLoading || isRefreshing)) {
    return <div>Loading...</div>;
  }

  if (isAuthError && refreshFailed) {
    return (
      <Navigate to="admin/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
};

export default RedirectProtectedRoutes;

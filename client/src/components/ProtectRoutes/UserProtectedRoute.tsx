import { Outlet, useLocation, Navigate } from "react-router-dom";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  clearCredentials,
  setCredentials,
} from "@/features/accessTokenApiSlice";

const UserProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const {
    isError: isAuthError,
    isLoading: isAuthLoading,
    error: authError,
  } = useCheckAuthQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [refreshToken, { isLoading: isRefreshing }] = useRefreshTokenMutation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const refreshAuthToken = async () => {
      if (isAuthError && authError && "status" in authError) {
        const statusCode = authError.status;

        if (statusCode === 401 || statusCode === 403) {
          try {
            const refreshResponse = await refreshToken().unwrap();
            dispatch(
              setCredentials({ accessToken: refreshResponse.access_token })
            );
          } catch (error) {
            console.error("Token refresh failed: ", error);
            dispatch(clearCredentials());
            setShouldRedirect(true); // Set redirect flag to true only once
          }
        } else {
          dispatch(clearCredentials());
          setShouldRedirect(true); // Other errors also trigger redirect
        }
      }
    };

    if (isAuthError && !shouldRedirect) {
      refreshAuthToken(); // Only refresh if not already redirecting
    }
  }, [isAuthError, authError, refreshToken, dispatch, shouldRedirect]);

  if (isAuthLoading || isRefreshing) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;

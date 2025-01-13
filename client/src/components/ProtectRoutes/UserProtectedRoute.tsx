import { Outlet, useLocation, Navigate } from "react-router";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice"; // Assuming this is the correct slice for access token

const UserProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isError, isLoading, error } = useCheckAuthQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const [finalError, setFinalError] = useState<Error | null>(null);

  const [
    refreshToken,
    { isLoading: isRefreshing, isError: isRefreshError, error: refreshError },
  ] = useRefreshTokenMutation();

  useEffect(() => {
    const refresh_the_token = async () => {
      if (isError && error && "status" in error) {
        const statusCode = error.status;
        if (statusCode === 401 || statusCode === 403) {
          // Attempt to refresh the token
          try {
            const refresh_response = await refreshToken().unwrap();
            dispatch(
              setCredentials({ accessToken: refresh_response.access_token })
            );
            if (
              isRefreshError &&
              refreshError &&
              refreshError instanceof Error
            ) {
              setFinalError(refreshError);
            }
          } catch (err: unknown) {
            // Check if err is an instance of Error
            if (err instanceof Error) {
              console.log("Refresh token error: ", err);
              setFinalError(err); // Now it's safe to set the error
            } else {
              // If err is not an instance of Error, create a generic error
              setFinalError(
                new Error("An unknown error occurred during token refresh.")
              );
            }
          }
        } else {
          // If the error isn't 401 or 403, set the final error to trigger navigation
          setFinalError(new Error("Unauthorized access or other error."));
        }
      }
    };
    refresh_the_token();
  }, [error, isError, refreshToken, dispatch, refreshError, isRefreshError]);

  // If loading, show loading spinner
  if (isLoading || isRefreshing) {
    return <div>Loading...</div>;
  }

  // If a refresh token error or any other error occurs, navigate to login
  if (
    finalError &&
    "status" in finalError &&
    (finalError.status === 401 || finalError.status === 403)
  ) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (finalError && "status" in finalError) {
    throw finalError;
  }

  // If authenticated, render the protected content
  return <Outlet />;
};

export default UserProtectedRoute;

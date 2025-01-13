// hooks/useAuthProtection.ts
import { useEffect, useState } from "react";
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
} from "@/features/userAuthApiSlice";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/features/accessTokenApiSlice"; // Assuming this is the correct slice for access token

export const useCheckAuth = () => {
  const dispatch = useAppDispatch();
  const {
    data: authData,
    isError,
    isLoading,
    error,
  } = useCheckAuthQuery(undefined, {
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
            // Handle errors during refresh token process
            if (err instanceof Error) {
              setFinalError(err);
            } else {
              setFinalError(
                new Error("An unknown error occurred during token refresh.")
              );
            }
          }
        } else {
          setFinalError(new Error("Unauthorized access or other error."));
        }
      }
    };

    refresh_the_token();
  }, [error, isError, refreshToken, dispatch, refreshError, isRefreshError]);

  // Handle loading state and errors
  if (isLoading || isRefreshing) {
    return { isLoading: true };
  }

  if (finalError) {
    return { finalError };
  }

  return { isLoading: false, authData };
};

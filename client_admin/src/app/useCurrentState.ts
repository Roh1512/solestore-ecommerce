import { useAppSelector } from "./hooks"; // Adjust the path to your custom hooks file
import { RootState } from "./store";

// Custom hook to get the entire state
export const useCurrentAuthState = () => {
  const { isLoggedIn, accessToken } = useAppSelector(
    (state: RootState) => state.auth
  );
  return { isLoggedIn, accessToken };
};

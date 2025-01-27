// src/app/useCurrentState.ts
import { useAppSelector } from "./hooks";
import { RootState } from "@/app/store";

export const useCurrentAuthState = () => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn
  );
  const accessToken = useAppSelector(
    (state: RootState) => state.auth.accessToken
  );

  return { isLoggedIn, accessToken };
};

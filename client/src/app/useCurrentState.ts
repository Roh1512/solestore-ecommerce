// src/app/useCurrentState.ts
import { useGetCartQuery } from "@/features/cartApiSlice";
import { useAppSelector } from "./hooks";
import { RootState } from "@/app/store";
import { userAuthApi } from "@/features/userAuthApiSlice";

export const useCurrentAuthState = () => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn
  );
  const accessToken = useAppSelector(
    (state: RootState) => state.auth.accessToken
  );

  return { isLoggedIn, accessToken };
};

export const useCurrentCartState = () => {
  const { data: cartData } = useGetCartQuery({
    search: "",
    page: 1,
  });

  const totalCount = cartData?.total_count;

  return { totalCount };
};

export const useCheckAuthState = () => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => userAuthApi.endpoints.checkAuth.select()(state).data
  );
  return { isLoggedIn };
};

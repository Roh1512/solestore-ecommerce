// src/app/useCurrentState.ts
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const useCurrentState = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.userAuthApi);

  return { auth, user };
};

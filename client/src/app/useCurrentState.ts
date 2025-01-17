import { useAppSelector } from "./hooks"; // Adjust the path to your custom hooks file
import { RootState } from "./store";

// Custom hook to get the entire state
export const useCurrentState = () => {
  return useAppSelector((state: RootState) => state);
};

import { Navigate, Outlet } from "react-router";
import { useCheckAuth } from "@/hooks/useCheckAuth";

const RedirectIfLoggedIn = () => {
  const { isLoading, finalError } = useCheckAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!finalError) {
    return <Navigate to="/shop" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default RedirectIfLoggedIn;

import { useCheckAuthQuery } from "@/features/adminAuthApiSlice";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import HeaderAdmin from "../Headers/HeaderAdmin";
import FooterAdmin from "../Footers/FooterAdmin";
import PageLoading from "../Loading/PageLoading";

const RedirectProtectedRoutes = () => {
  const { isError: isAuthError, isLoading: isAuthLoading } = useCheckAuthQuery(
    undefined,
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const location = useLocation();

  if (isAuthLoading) return <PageLoading />;

  if (isAuthError)
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );

  return (
    <>
      <HeaderAdmin />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterAdmin />
    </>
  );
};

export default RedirectProtectedRoutes;

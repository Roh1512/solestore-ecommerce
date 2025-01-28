import { Navigate, Outlet } from "react-router-dom";
import HeaderAdmin from "../Headers/HeaderAdmin";
import FooterAdmin from "../Footers/FooterAdmin";
import { useCheckAuthQuery } from "@/features/adminAuthApiSlice";
import PageLoading from "../Loading/PageLoading";

const RedirectUnprotectedRoutes = () => {
  const {
    data: authData,
    isLoading: isAuthLoading,
    isError,
    isSuccess,
  } = useCheckAuthQuery();

  if (isAuthLoading) {
    return <PageLoading />;
  }

  if (isError || (isSuccess && authData?.status !== "authenticated")) {
    // Allow access to unprotected routes
    return (
      <>
        <HeaderAdmin />
        <main className="flex flex-col items-center justify-center">
          <Outlet />
        </main>
        <FooterAdmin />
      </>
    );
  }

  if (isSuccess && authData?.status === "authenticated") {
    // Redirect to the dashboard for authenticated users
    return <Navigate to="/admin/dashboard" replace />;
  }

  return null; // Fallback (shouldn't be reached)
};

export default RedirectUnprotectedRoutes;

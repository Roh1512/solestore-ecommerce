import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { lazy } from "react";

import { useTheme } from "./context/ThemeContext";

const AdminLandingPage = lazy(
  () => import("@pages/LandingPage/AdminLandingPage")
);
const LoginPage = lazy(() => import("@pages/LoginPage/LoginPage"));
const Dashboard = lazy(() => import("@pages/Dashboard/Dashboard"));
const BrandsPage = lazy(() => import("@pages/Brands/BrandPage"));
const CategoriesPage = lazy(() => import("@pages/Categories/CategoriesPage"));
const ProfilePage = lazy(() => import("@pages/profile/ProfilePage"));
const NotFound = lazy(() => import("@components/ErrorElements/NotFound"));
const ErrorElement = lazy(
  () => import("@components/ErrorElements/ErrorElement")
);

import RedirectUnprotectedRoutes from "@components/RedirectWrappers/RedirectUnprotectedRoutes";
import RedirectProtectedRoutes from "./components/RedirectWrappers/RedirectProtectedRoutes";
import PageLoading from "./components/Loading/PageLoading";
import SuspenseWrapper from "./components/Wrappers/SuspenseWrapper";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        element={<RedirectUnprotectedRoutes />}
        errorElement={
          <SuspenseWrapper>
            <ErrorElement />
          </SuspenseWrapper>
        }
      >
        <Route path="/admin" element={<AdminLandingPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
      </Route>

      <Route
        element={<RedirectProtectedRoutes />}
        errorElement={
          <SuspenseWrapper>
            <ErrorElement />
          </SuspenseWrapper>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/brands" element={<BrandsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/loading" element={<PageLoading />} />
      </Route>
      <Route
        path="*"
        element={
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        }
      />
    </>
  )
);

function App() {
  const { theme } = useTheme();
  const themeText = theme === "business" ? "dark" : "light";
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme={themeText} />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

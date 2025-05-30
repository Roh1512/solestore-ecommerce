import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { lazy, useEffect } from "react";

import { useTheme } from "./context/ThemeContext";

import NotFound from "@components/ErrorElements/NotFound";
import ErrorElement from "@components/ErrorElements/ErrorElement";

const AdminLandingPage = lazy(
  () => import("@pages/LandingPage/AdminLandingPage")
);
const LoginPage = lazy(() => import("@pages/LoginPage/LoginPage"));
const Dashboard = lazy(() => import("@pages/Dashboard/Dashboard"));
const BrandsPage = lazy(() => import("@pages/Brands/BrandPage"));
const CategoriesPage = lazy(() => import("@pages/Categories/CategoriesPage"));
const ProfilePage = lazy(() => import("@pages/profile/ProfilePage"));
const AdminsPage = lazy(() => import("@pages/Admins/AdminsPage"));
const AdminByIdPage = lazy(() => import("@pages/Admins/AdminByIdPage"));
const Products = lazy(() => import("@pages/Products/Products"));
const ProductById = lazy(() => import("@pages/Products/ProductById"));
const AddProduct = lazy(() => import("@pages/Products/AddProduct"));
const OrdersPage = lazy(() => import("@pages/Orders/OrdersPage"));
const OrderDetail = lazy(() => import("@pages/Orders/OrderDetail"));

import RedirectUnprotectedRoutes from "@components/RedirectWrappers/RedirectUnprotectedRoutes";
import RedirectProtectedRoutes from "./components/RedirectWrappers/RedirectProtectedRoutes";
import SuspenseWrapper from "./components/Wrappers/SuspenseWrapper";
import { useCurrentAuthState } from "./app/useCurrentState";
import { initWebSocket } from "./services/webSocketService";
import { store } from "./app/store";

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
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/products/add" element={<AddProduct />} />
        <Route path="/admin/products/:productId" element={<ProductById />} />
        <Route path="/admin/admins" element={<AdminsPage />} />
        <Route path="/admin/admins/:adminId" element={<AdminByIdPage />} />

        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/orders/:orderId" element={<OrderDetail />} />
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
  const { accessToken } = useCurrentAuthState();
  const themeText = theme === "coffee" ? "dark" : "light";
  useEffect(() => {
    if (accessToken) {
      const cleanup = initWebSocket(store, accessToken);
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [accessToken]);
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme={themeText} />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

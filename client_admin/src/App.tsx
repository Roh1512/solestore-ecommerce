import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import AdminLandingPage from "@pages/LandingPage/AdminLandingPage";
import LoginPage from "@pages/LoginPage/LoginPage";
import { ToastContainer } from "react-toastify";
import RedirectUnprotectedRoutes from "@components/RedirectWrappers/RedirectUnprotectedRoutes";
import NotFound from "@components/ErrorElements/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import RedirectProtectedRoutes from "./components/RedirectWrappers/RedirectProtectedRoutes";
import { useTheme } from "./context/ThemeContext";
import ProfilePage from "./pages/profile/ProfilePage";
import PageLoading from "./components/Loading/PageLoading";
import BrandsPage from "./pages/Brands/BrandPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<RedirectUnprotectedRoutes />}>
        <Route path="/admin" element={<AdminLandingPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
      </Route>

      <Route element={<RedirectProtectedRoutes />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/brands" element={<BrandsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/loading" element={<PageLoading />} />
      </Route>
      <Route path="*" element={<NotFound />} />
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

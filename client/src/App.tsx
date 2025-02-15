import { lazy } from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import UserAuthLayout from "./components/Layouts/UserAuthLayout/UserAuthLayout";
import { useTheme } from "./context/ThemeContext";

const LandingPage = lazy(() => import("@pages/landingPage/LandingPage"));
const RegisterUser = lazy(
  () => import("@pages/userPages/RegisterUser/RegisterUser")
);
const LoginUser = lazy(() => import("@pages/userPages/LoginUser/LoginUser"));
const ProfilePage = lazy(() => import("@pages/Profile/ProfilePage"));
const ShopPage = lazy(() => import("@pages/ShopPages/ShopPage"));

import UserProtectedRoute from "./components/ProtectRoutes/UserProtectedRoute";
import RedirectIfLoggedIn from "./components/RedirectWrapper/RedirectIfLoggedIn";
import PageLoading from "./components/Loading/PageLoading";
import SuspenseWrapper from "./components/SuspenseWrapper/SuspenseWrapper";
import ErrorElement from "@components/ErrorElements/ErrorElement";
import NotFound from "@components/NotFound/NotFound";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* UserAuthLayout wrapping RegisterUser and LoginUser */}
      <Route
        element={<RedirectIfLoggedIn />}
        errorElement={
          <SuspenseWrapper>
            <ErrorElement />
          </SuspenseWrapper>
        }
      >
        <Route path="/" element={<LandingPage />} />
        <Route element={<UserAuthLayout />}>
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login" element={<LoginUser />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<UserProtectedRoute />} errorElement={<ErrorElement />}>
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/loading" element={<PageLoading />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </>
  )
);

function App() {
  const { theme } = useTheme();
  const themeValue = theme === "business" ? "dark" : "light";
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={themeValue}
      />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

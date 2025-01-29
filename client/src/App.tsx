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
const NotFound = lazy(() => import("@components/NotFound/NotFound"));
const ProfilePage = lazy(() => import("@pages/Profile/ProfilePage"));
const ErrorElement = lazy(
  () => import("@components/ErrorElements/ErrorElement")
);

import UserProtectedRoute from "./components/ProtectRoutes/UserProtectedRoute";
import { Link } from "react-router-dom";
import RedirectIfLoggedIn from "./components/RedirectWrapper/RedirectIfLoggedIn";
import PageLoading from "./components/Loading/PageLoading";
import SuspenseWrapper from "./components/SuspenseWrapper/SuspenseWrapper";

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
      <Route
        element={<UserProtectedRoute />}
        errorElement={
          <SuspenseWrapper>
            <ErrorElement />
          </SuspenseWrapper>
        }
      >
        <Route
          path="/shop"
          element={
            <>
              <h1>Shop</h1>
              <div className="flex gap-6 mb-5">
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
                <Link to="/">Home</Link>
              </div>
            </>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/loading" element={<PageLoading />} />
      </Route>

      <Route
        path="*"
        element={
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
          // The NotFound route doesn’t need to be wrapped in ErrorBoundary and Suspense unless it’s lazy-loaded or might throw an error. Since it’s a static component, you can simplify it.
        }
      />
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

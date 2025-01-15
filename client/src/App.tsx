import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { ToastContainer } from "react-toastify";
import LandingPage from "./pages/landingPage/LandingPage";
import RegisterUser from "./pages/userPages/RegisterUser/RegisterUser";
import LoginUser from "./pages/userPages/LoginUser/LoginUser";
import NotFound from "./components/NotFound/NotFound";
import UserProtectedRoute from "./components/ProtectRoutes/UserProtectedRoute";
import LogoutButton from "./components/LogoutButtons/LogoutUser";
import { Link } from "react-router-dom";
import RedirectIfLoggedIn from "./components/RedirectWrapper/RedirectIfLoggedIn";
import UserAuthLayout from "./components/Layouts/UserAuthLayout/UserAuthLayout";
import { useTheme } from "./context/ThemeContext";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* UserAuthLayout wrapping RegisterUser and LoginUser */}
      <Route element={<RedirectIfLoggedIn />}>
        <Route path="/" element={<LandingPage />} />
        <Route element={<UserAuthLayout />}>
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login" element={<LoginUser />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<UserProtectedRoute />}>
        <Route
          path="/shop"
          element={
            <>
              <h1>Shop</h1>
              <LogoutButton /> {/* Should render here */}
              <div className="flex gap-6 mb-5">
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
                <Link to="/">Home</Link>
                <Link to="/profile">PROFILE</Link>
              </div>
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <h1>Profile</h1>
              <Link to="/shop">SHOP</Link>
            </>
          }
        />
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

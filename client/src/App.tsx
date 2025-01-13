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
import UserAuthLayout from "./components/Layouts/UserAuthLayout/UserAuthLayout";
import NotFound from "./components/NotFound/NotFound";
import UserProtectedRoute from "./components/ProtectRoutes/UserProtectedRoute";
import LogoutButton from "./components/LogoutButtons/LogoutUser";
import RedirectIfLoggedIn from "./components/RedirectWrapper/RedirectIfLoggedIn";
import { Link } from "react-router-dom";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<RedirectIfLoggedIn />}>
        <Route path="/" element={<LandingPage />} />

        {/* UserAuthLayout wrapping RegisterUser and LoginUser */}

        <Route element={<UserAuthLayout />}>
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route element={<UserProtectedRoute />}>
        <Route
          path="/shop"
          element={
            <>
              <h1>Shop</h1>
              <LogoutButton />
              <Link to="/">Login</Link>
              <Link to="/profile">PROFILE</Link>
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
    </>
  )
);

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

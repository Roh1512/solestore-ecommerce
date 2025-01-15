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

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<RedirectUnprotectedRoutes />}>
        <Route path="/admin" element={<AdminLandingPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
      </Route>

      <Route element={<RedirectProtectedRoutes />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
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

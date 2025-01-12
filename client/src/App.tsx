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

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />

      {/* UserAuthLayout wrapping RegisterUser and LoginUser */}
      <Route element={<UserAuthLayout />}>
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/login" element={<LoginUser />} />
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

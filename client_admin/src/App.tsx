import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/admin" element={<h1>Admin home</h1>} />
    </>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

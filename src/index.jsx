import ReactDOM from "react-dom/client";
import "./style.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from "./component/Header/Header";
import Footer from "./component/Footer/Footer";
import AdminDashboard from "./component/AdminDashboard/AdminDashboard";
import LoginPage from "./component/LoginPage/LoginPage";
import RegisterPage from "./component/RegisterPage/RegisterPage";
import UserDashboard from "./component/UserDashboard/UserDashboard";
import ErrorPage from "./component/ErrorPage/ErrorPage";
import { AuthProvider } from "./context/AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
  return (
    <>
      <Header/>
      <Outlet/>
      <Footer/>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/dashboard",
        element: <UserDashboard />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

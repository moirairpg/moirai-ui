import isUserAuthenticated from "@/app/isUserAuthenticated";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const userAuth = isUserAuthenticated();
  // If the user is authenticated, render the child routes, otherwise redirect to login
  return userAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

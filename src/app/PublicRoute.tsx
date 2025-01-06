import isUserAuthenticated from "@/app/isUserAuthenticated";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const userAuth = isUserAuthenticated();
  // If the user is authenticated, render the child routes, otherwise redirect to login
  return !userAuth ? <Outlet /> : <Navigate to="/worlds" />;
};

export default PublicRoute;

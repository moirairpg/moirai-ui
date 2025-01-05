import { Outlet } from "react-router-dom";
import useUserAuthenticated from "../hooks/useUserAuthenticated";
import PrivateLayout from "./components/PrivateLayout";

const Layout = () => {
  const { isUserAuthenticated } = useUserAuthenticated();

  return (
    <div>
      {isUserAuthenticated ? (
        <PrivateLayout>
          <Outlet />
        </PrivateLayout>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Layout;

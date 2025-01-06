import { Outlet } from "react-router-dom";
import isUserAuthenticated from "../app/isUserAuthenticated";
import PrivateLayout from "./components/PrivateLayout";

const Layout = () => {
  const userAuth = isUserAuthenticated();

  return (
    <div>
      {userAuth ? (
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

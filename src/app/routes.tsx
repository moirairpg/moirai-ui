import Layout from "@/layout/Layout";
import { CreateWorldPage } from "@/pages/create-world";
import ErrorPage from "@/pages/errors/errorPageRoute";
import Login from "@/pages/signIn";
import WorldPage from "@/pages/worlds";
import { queryClient } from "@/utils/queryClient";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { loader } from "@/pages/worlds/loader";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} errorElement={<ErrorPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route
          path="/worlds"
          element={<WorldPage />}
          loader={loader(queryClient)}
          errorElement={<ErrorPage />}
        />
        <Route
          path="/worlds/create-world"
          element={<CreateWorldPage />}
          errorElement={<ErrorPage />}
        />
      </Route>
    </Route>
  )
);

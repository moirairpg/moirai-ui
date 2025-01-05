import App from "@/App";
import Layout from "@/layout/Layout";
import { CreateWorldPage } from "@/pages/create-world";
import ErrorPage from "@/pages/errors/errorPageRoute";
import Login from "@/pages/signIn";
import WorldPage, { loader } from "@/pages/worlds";
import { queryClient } from "@/utils/queryClient";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<App />} />
      <Route index element={<App />} />
      <Route path="/login" element={<Login />} errorElement={<ErrorPage />} />
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
  )
);

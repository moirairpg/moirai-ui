import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";
import { worldsListQuery } from "./worldsListQuery";

export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    await queryClient.ensureQueryData(worldsListQuery(q));
    return { q };
  };

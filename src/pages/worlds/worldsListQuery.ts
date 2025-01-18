import { queryOptions } from "@tanstack/react-query";
import { getWorlds } from "./services/worlds";

export const worldsListQuery = (q?: string) =>
  queryOptions({
    queryKey: ["worlds", "list", q ?? "all"],
    queryFn: () => getWorlds(),
  });

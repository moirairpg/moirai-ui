/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { WorldsContainer } from "./components/worldsContainer";
import {
  QueryClient,
  queryOptions,
  useIsFetching,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getWorlds } from "./services/worlds";
import { useDebounce } from "use-debounce";

const worldsListQuery = (q?: string) =>
  queryOptions({
    queryKey: ["worlds", "list", q ?? "all"],
    queryFn: () => getWorlds(),
  });

export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    await queryClient.ensureQueryData(worldsListQuery(q));
    return { q };
  };

export default function WorldPage() {
  const { q } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const { data: worldsList } = useSuspenseQuery(worldsListQuery(q));
  const searching = useIsFetching({ queryKey: ["contacts", "list"] }) > 0;
  const navigation = useNavigation();
  const submit = useSubmit();

  const debouncedSubmit = useDebounce(submit, 500);

  return (
    <>
      {worldsList && worldsList.length > 0 ? (
        <div className="hidden flex-col md:flex max-h-[90vh]">
          <WorldsContainer worlds={worldsList} />
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No worlds found
        </div>
      )}
    </>
  );
}

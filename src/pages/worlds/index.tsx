import {
  useLoaderData,
  // useNavigation,
  // useSubmit,
} from "react-router-dom";
import { WorldsContainer } from "./components/worldsContainer";
import {
  // useIsFetching,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { loader } from "./loader";
import { worldsListQuery } from "./worldsListQuery";
// import { useDebounce } from "use-debounce";

export default function WorldPage() {
  const { q } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const { data: worldsList } = useSuspenseQuery(worldsListQuery(q));
  // const searching = useIsFetching({ queryKey: ["contacts", "list"] }) > 0;
  // const navigation = useNavigation();
  // const submit = useSubmit();

  // const debouncedSubmit = useDebounce(submit, 500);

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

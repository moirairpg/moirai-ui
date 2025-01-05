import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";
import { router } from "@/app/routes";
import { queryClient } from "@/utils/queryClient";

const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default Root;

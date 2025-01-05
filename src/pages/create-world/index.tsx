import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { worldSchema } from "./validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createWorld } from "./services/worlds";
import Header from "./components/CreateWorldHeader";
import CreateWorldFooter from "./components/CreateWorldFooter";
import WorldDetailsForm from "./components/CreateWorldForm/WorldDetailsForm";
import LorebookForm from "./components/CreateWorldForm/LorebookForm";
import { CreateWorld } from "./types";

export function CreateWorldPage() {
  const form = useForm<CreateWorld>({
    resolver: zodResolver(worldSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "",
      usersAllowedToRead: [],
      usersAllowedToWrite: [],
      worldImages: [],
      lorebook: [],
    },
  });
  const onSubmit = (values: CreateWorld) => {
    console.log("values ", values);
    mutate(values);
  };

  const { mutate } = useMutation({
    mutationFn: (values: CreateWorld) => createWorld(values),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex-col md:flex">
          <main className="flex items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
              <Header />
              <div className="grid gap-4 lg:gap-8">
                <div className="flex-col items-start justify-center gap-6 lg:col-span-2 lg:gap-8">
                  <WorldDetailsForm form={form} />

                  <LorebookForm form={form} />
                </div>
              </div>
              <CreateWorldFooter />
            </div>
          </main>
        </div>
      </form>
    </Form>
  );
}

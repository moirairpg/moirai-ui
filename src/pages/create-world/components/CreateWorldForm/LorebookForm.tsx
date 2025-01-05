import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PlusCircle } from "lucide-react";
import { CreateWorld } from "../../types";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

type LorebookProps = {
  form: UseFormReturn<CreateWorld, unknown, undefined>;
};
const LorebookForm = ({ form }: LorebookProps) => {
  const [open, setOpen] = useState(false);
  const onSubmit = () => {
    console.log("values ", form.getValues("lorebook"));
    if (!form.getFieldState("lorebook").invalid) {
      setOpen(false);
    }
  };

  const { fields } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "lorebook", // unique name for your Field Array
  });

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Lorebook</CardTitle>
        <CardDescription>
          Lipsum dolor sit amet, consectetur adipiscing elit
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
            x-chunk="dashboard-02-chunk-1"
          >
            <div className="flex flex-col items-center gap-1 text-center">
              {form.getValues("lorebook").length > 0 &&
              !form.getFieldState("lorebook").invalid ? (
                <></>
              ) : (
                <>
                  <h3 className="font-bold tracking-tight mt-4">
                    You have no lorebook entries
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add a new lorebook entry and start your adventure!
                  </p>
                </>
              )}

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="mt-4 mb-4">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Lorebook Entry
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Create lorebook Entry</SheetTitle>
                    <SheetDescription>
                      Click save when you are done.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`lorebook.${fields.length}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Lorebook entry name"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription> </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`lorebook.${fields.length}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc nisl ultricies nunc, nec ultricies nunc nisl nec nunc."
                                className="min-h-32"
                                //   className="min-h-32 col-span-3 "
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription> </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`lorebook.${fields.length}.regex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regex</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="[2-9]|[12]\d|3[0-6]"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription> </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`lorebook.${fields.length}.playerDiscordId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Lorebook entry Player Discord ID"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription> </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    {/* <SheetClose asChild> */}
                    <Button
                      onClick={async () => {
                        await form.trigger("lorebook");
                        if (!form.getFieldState("lorebook").invalid) onSubmit();
                      }}
                    >
                      Save changes
                    </Button>
                    {/* </SheetClose> */}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </main>
      </div>
    </Card>
  );
};

export default LorebookForm;

import { ListFilter, PlusCircle, Search } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useWorld } from "../useWorlds";
import { WorldOverview } from "./worldOverview";
import { WorldList } from "./worldsList";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { World } from "../types";

interface WorldProps {
  worlds: World[];
}

export function WorldsContainer({ worlds }: WorldProps) {
  const [world] = useWorld();
  const navigate = useNavigate();
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel defaultSize={140} minSize={30}>
          <Tabs defaultValue="all">
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="space-between flex items-center mb-4">
                  <TabsList>
                    <TabsTrigger
                      value="all"
                      className="text-zinc-600 dark:text-zinc-200"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="mine"
                      className="text-zinc-600 dark:text-zinc-200"
                    >
                      Mine
                    </TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                        >
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                          Public
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          Private
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/worlds/create-world");
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add World
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <WorldList items={worlds} />
            </TabsContent>
            <TabsContent value="mine" className="m-0">
              <WorldList items={worlds.filter((item) => !item.visibility)} />
            </TabsContent>
            <TabsContent value="favourite" className="m-0">
              <WorldList items={worlds.filter((item) => !item.visibility)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={260} minSize={30}>
          <WorldOverview
            world={worlds.find((item) => item.id === world.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

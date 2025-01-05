import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorld } from "../useWorlds";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleIcon, StarIcon } from "lucide-react";
import { World } from "../types";

interface WorldListProps {
  items: World[];
}

export function WorldList({ items }: WorldListProps) {
  const [world, setWorld] = useWorld();
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-4 p-4 pt-0">
        {items.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer",
              world.selected === item.id && "bg-muted"
            )}
            onClick={() =>
              setWorld({
                ...world,
                selected: item.id,
              })
            }
          >
            <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 p-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="text-xs font-medium">{item.ownerDiscordId}</div>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {item.description.substring(0, 300)}
                </CardDescription>
              </div>
              <div className="flex items-center justify-end space-x-1 rounded-md bg-default text-default-foreground">
                <Button variant="default" className="px-3 shadow-none">
                  <StarIcon className=" h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div className="flex space-x-4 text-muted-foreground">
                  <div className="flex items-center">
                    <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
                    {item.visibility}
                  </div>

                  <div className="flex items-center">
                    <StarIcon className="mr-1 h-3 w-3" />
                    20k
                  </div>
                </div>
                <div
                  className={cn(
                    world.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(item.lastUpdateDate), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

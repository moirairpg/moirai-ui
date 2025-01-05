import { format } from "date-fns/format";
import { File, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { World } from "../types";

interface WorldOverviewProps {
  world: World | null;
}

export function WorldOverview({ world }: WorldOverviewProps) {
  return (
    <div className="flex h-screen flex-col">
      {world ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={world.name} />
                <AvatarFallback>
                  {world.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{world.name}</div>
                <div className="line-clamp-1 text-xs">
                  {world.ownerDiscordId}
                </div>
                {world.lastUpdateDate && (
                  <div>{format(new Date(world.lastUpdateDate), "PPpp")}</div>
                )}
              </div>
            </div>
            <div className="ml-auto text-xs text-muted-foreground flex items-center">
              <Button size="sm" variant="outline">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!world}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Move to trash</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {world.description}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No world selected
        </div>
      )}
    </div>
  );
}

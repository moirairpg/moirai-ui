import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

type UserAuthFormProps = React.InputHTMLAttributes<HTMLInputElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Continue with
          </span>
        </div>
      </div>
      <a
        href="https://discord.com/oauth2/authorize?client_id=1159186267465064530&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcode&scope=identify"
        className="flex items-center justify-center w-[100%]"
      >
        <Button
          variant="outline"
          type="button"
          className="flex items-center justify-center gap-3 w-[100%]"
        >
          <Icons.discord className="mr-2 h-4 w-4" />
          Discord
        </Button>
      </a>
    </div>
  );
}

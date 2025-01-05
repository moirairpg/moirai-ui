import { UseFormReturn } from "react-hook-form";
import { worldSchema } from "./validationSchema";
import { z } from "zod";

export type CreateWorld = z.infer<typeof worldSchema>;

export type form = UseFormReturn<CreateWorld>;

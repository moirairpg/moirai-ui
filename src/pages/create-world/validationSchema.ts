import { z } from "zod";

export const lorebookEntrySchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  regex: z.string().optional(),
  description: z.string().min(1, { message: "Required" }),
  playerDiscordId: z.string().optional(),
});

export const worldSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  description: z.string().min(1, { message: "Required" }),
  visibility: z.string().min(1, { message: "Required" }),
  usersAllowedToRead: z.array(z.string()),
  usersAllowedToWrite: z.array(z.string()).optional(),
  worldImages: z.array(z.string()).optional(),
  lorebook: z.array(lorebookEntrySchema.optional()),
});

// export const worldSchema = <T extends boolean>(isLorebookActive: T) => {
//   return z.object({
//     name: z.string().min(1, { message: "Required" }),
//     description: z.string().min(1, { message: "Required" }),
//     visibility: z.string().min(1, { message: "Required" }),
//     usersAllowedToRead: z.array(z.string()),
//     usersAllowedToWrite: z.array(z.string()).optional(),
//     worldImages: z.array(z.string()).optional(),
//     lorebook: isLorebookActive
//       ? z.array(lorebookEntrySchema)
//       : z.array(lorebookEntrySchema.optional()),
//   });
// };

import { CreateWorld } from "../create-world/types";

export type World = {
  id: string;
  ownerDiscordId: string;
  creationDate: string;
  lastUpdateDate: string;
} & CreateWorld;

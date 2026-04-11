export interface Adventure {
  id: string;
  title: string;
  worldId?: string;
  personaId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface World {
  id: string;
  name: string;
  description?: string;
}

export interface Persona {
  id: string;
  name: string;
  description?: string;
}

export type AppSocketMessage =
  | { type: 'adventures_updated'; adventures: Adventure[] }
  | { type?: string; [key: string]: unknown };

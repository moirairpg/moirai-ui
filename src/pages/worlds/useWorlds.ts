import { atom, useAtom } from "jotai";
import { World } from "./types";

type Config = {
  selected: World["id"] | null;
};

const worldsAtom = atom<Config>({
  selected: null,
});

export function useWorld() {
  return useAtom(worldsAtom);
}

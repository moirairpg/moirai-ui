import axios from "axios";
import { World } from "../types";

export const getWorlds = async (): Promise<World[]> => {
  try {
    const res = await axios.get(
      "http://localhost:3000/api/world?page=1&size=10"
    );
    console.log(" res    ", res);
    return res.data.results;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

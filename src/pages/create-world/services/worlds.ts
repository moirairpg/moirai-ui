import { World } from "@/pages/worlds/types";
import axios from "axios";
import { CreateWorld } from "../types";

export const createWorld = async (data: CreateWorld) => {
  console.log(data);
  // const res = await axios.post("http://localhost:3000/api/", data);
  // console.log(res);
  // return res;
};

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

import { User } from "@/features/types";
import axiosInstance from "../axios";
import { config } from "../utils";

export const fetchUser = async (username: string): Promise<User> => {
  const res = await axiosInstance.get(`${config.url}/api/v1/users/username/${username}`);
  return res.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const res = await axiosInstance.get(`${config.url}/api/v1/users/me`);
  return res.data;
};

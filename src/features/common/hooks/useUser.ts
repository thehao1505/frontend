"use client";

import { useEffect, useState } from "react";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";

const useUser = (username: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    setUser(null);
    setError(null);
    setLoadingUser(true);

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(
          `${config.url}/api/v1/users/username/${username}`
        );

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user data");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [username]);

  return { user, loadingUser, error };
};

export default useUser;

"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`${config.url}/api/v1/users/me`);
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Error fetching user data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { currentUser, loading, error, refetch: fetchUser };
};

export default useCurrentUser;

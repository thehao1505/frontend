"use client";

import { useEffect, useState } from "react";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`
        );
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { currentUser, loading, error };
};

export default useCurrentUser;

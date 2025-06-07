import { useEffect, useState } from "react";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/username/${username}`
        );
        const mappedUser: User = {
          _id: res.data._id,
          username: res.data.username,
          fullName: res.data.fullName,
          shortDescription: res.data.shortDescription,
          email: res.data.email,
          avatar: res.data.avatar,
          followers: res.data.followers || [],
          followings: res.data.followings || [],
        };

        setUser(mappedUser);
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

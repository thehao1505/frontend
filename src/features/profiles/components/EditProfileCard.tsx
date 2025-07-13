"use client";

import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/features/types";
import axiosInstance from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useCallback, useEffect, useRef, useState } from "react";

interface UserDetails {
  _id: string;
  isDeleted: boolean;
  username: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordChangeAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  followings: string[];
  followers: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  __v: number;
  shortDescription: string;
}

export default function EditProfileCard({
  currentUser,
  onProfileUpdated,
}: {
  currentUser: User | null;
  onProfileUpdated: () => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/upload/multiple`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setAvatar(res.data[0]);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${currentUser?._id}`
      );
      setUserDetails(res.data);
      setAvatar(res.data.avatar);
    } catch (error) {
      console.log(error);
    }
  }, [currentUser?._id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!userDetails) return;
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleSave = async () => {
    if (!userDetails) return;
    setIsSaving(true);
    try {
      await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userDetails._id}`,
        {
          username: userDetails.username,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          shortDescription: userDetails.shortDescription,
          avatar: avatar,
        }
      );
      setShowPopup(false);
      onProfileUpdated();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowPopup(true)}
        className="text-white font-semibold rounded-lg w-full border-[1px] border-neutral-700"
      >
        Edit Profile
      </Button>

      {showPopup && (
        <Modal
          title="Edit Profile"
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false);
          }}
        >
          <div className="flex flex-row justify-between px-6 py-3 rounded-lg bg-neutral-800 mb-4">
            <div className="flex flex-row border-b items-center border-neutral-800">
              <Avatar className="w-12 h-12 rounded-full overflow-hidden">
                <AvatarImage
                  src={avatar || userDetails?.avatar}
                  alt={userDetails?.username}
                  className="object-cover"
                />
                <AvatarFallback>{userDetails?.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm font-medium pl-3 text-white">
                <span className="text-[15px] font-semibold">{userDetails?.username}</span>
                <span className="text-sm text-muted-foreground">{userDetails?.fullName}</span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                className="font-semibold rounded-lg w-full border bg-white text-black border-neutral-800 hover:bg-black hover:text-white"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
              >
                Change Avatar
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-4 text-white">
            <label className="text-sm font-medium">Username</label>
            <Input
              className="border-neutral-800 border-[2px]"
              disabled={true}
              name="username"
              placeholder="Username"
              value={userDetails?.username}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">First name</label>
            <Input
              className="border-neutral-800 border-[2px]"
              name="firstName"
              placeholder="First Name"
              value={userDetails?.firstName}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">Last name</label>
            <Input
              className="border-neutral-800 border-[2px]"
              name="lastName"
              placeholder="Last Name"
              value={userDetails?.lastName}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">Description</label>
            <Textarea
              className="border-neutral-800 border-[2px]"
              name="shortDescription"
              placeholder="Short Description"
              value={userDetails?.shortDescription}
              onChange={handleChange}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowPopup(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

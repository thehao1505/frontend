"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import useCurrentUser from "@/features/common/hooks/useCurrentUser";

const INTERESTS = [
  "tech",
  "travel",
  "food",
  "music",
  "sports",
  "fashion",
  "art",
  "photography",
  "reading",
  "gaming",
  "fitness",
  "movies",
  "cooking",
  "nature",
  "business",
  "education",
];

export const InterestSelectionCard = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { currentUser, loading: userLoading } = useCurrentUser();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError("Vui lòng chọn ít nhất một sở thích");
      return;
    }

    if (!currentUser?._id) {
      setError("Không thể lấy thông tin người dùng");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.patch(
        `${config.url}/api/v1/users/${currentUser._id}`,
        {
          persona: selectedInterests,
        }
      );

      router.push("/");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật sở thích"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  if (userLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="w-full h-full p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Chọn sở thích của bạn</CardTitle>
          <CardDescription>
            Chọn một vài sở thích để chúng tôi có thể gợi ý nội dung phù hợp với
            bạn
          </CardDescription>
        </CardHeader>
        {!!error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
            <TriangleAlert className="size-4" />
            <p>{error}</p>
          </div>
        )}
        <CardContent className="space-y-6 px-0 pb-0">
          <div className="flex flex-wrap gap-3">
            {INTERESTS.map((interest) => (
              <Button
                key={interest}
                type="button"
                variant={
                  selectedInterests.includes(interest) ? "default" : "outline"
                }
                onClick={() => toggleInterest(interest)}
                disabled={isLoading}
                className="capitalize"
              >
                {interest}
              </Button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedInterests.length === 0}
              size="lg"
              className="flex-1"
            >
              {isLoading ? "Đang lưu..." : "Hoàn tất"}
            </Button>
            <Button
              onClick={handleSkip}
              disabled={isLoading}
              variant="ghost"
              size="lg"
            >
              Bỏ qua
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

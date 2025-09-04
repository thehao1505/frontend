import { Notification } from "@/features/types";
import { useRouter } from "next/navigation";

export const NotificationLabel = ({
  notification,
}: {
  notification: Notification;
}) => {
  const router = useRouter();

  const handleNotificationClick = () => {
    switch (notification.type) {
      case "FOLLOW":
        router.push(`/@${notification.senderId.username}`);
        break;
      case "LIKE":
        router.push(
          `/@${notification.senderId.username}/post/${notification.postId?._id}`
        );
        break;
      case "POST_REPLY":
        router.push(`/@${notification.senderId.username}/post/${notification}`);
    }
  };
};

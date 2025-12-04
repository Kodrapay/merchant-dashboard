import { useQuery } from "@tanstack/react-query";
import { getMerchantUser } from "@/lib/merchant-user";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Notification {
  id: string;
  subject: string;
  message: string;
  created_at: string;
}

const fetchNotifications = async (merchantId: string | undefined): Promise<Notification[]> => {
  if (!merchantId) {
    return [];
  }
  const response = await fetch(`${API_URL}/notifications/merchant/${merchantId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  const data = await response.json();
  return data.notifications;
};

export const useNotifications = () => {
  const merchant = getMerchantUser();
  const merchantId = merchant?.id;

  return useQuery<Notification[], Error>({
    queryKey: ["notifications", merchantId],
    queryFn: () => fetchNotifications(merchantId),
    enabled: !!merchantId,
  });
};
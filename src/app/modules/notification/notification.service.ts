import { IAuthUser } from "../../interfaces/user.interface";

const getMyNotifications = async (user: IAuthUser) => {
    // TODO: Implement actual database call once schema is ready
  return [];
};

export const notificationService = {
  getMyNotifications,
};

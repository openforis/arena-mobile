import { ImageUtils } from "utils/ImageUtils";
import { RemoteService } from "./remoteService";

const fetchUser = async () => {
  const { data } = await RemoteService.get("/auth/user");
  return data.user;
};

const fetchUserPicture = async (userUuid: string) => {
  const fileUri = await RemoteService.getFile(
    `/api/user/${userUuid}/profilePicture`
  );
  return (await ImageUtils.isValid(fileUri)) ? fileUri : null;
};

export const UserService = {
  fetchUser,
  fetchUserPicture,
};

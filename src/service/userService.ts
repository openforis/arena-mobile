import { ImageUtils } from "utils/ImageUtils";
import { log } from "utils/Logger";
import { RemoteService } from "./remoteService";

const fetchUser = async () => {
  const { data } = await RemoteService.get("/auth/user");
  return data.user;
};

const fetchUserPicture = async (userUuid: string) => {
  try {
    const fileUri = await RemoteService.getFileOrThrow(
      `/api/user/${userUuid}/profilePicture`,
    );
    return (await ImageUtils.isValid(fileUri)) ? fileUri : null;
  } catch (error) {
    // e.g. the user has no picture
    log.debug(`error fetching user picture: ${error}`);
    return null;
  }
};

export const UserService = {
  fetchUser,
  fetchUserPicture,
};

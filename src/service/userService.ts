import { ArenaUser } from "@openforis/arena-core";

import { ImageUtils } from "utils/ImageUtils";
import { log } from "utils/Logger";
import { asyncStorageKeys } from "./asyncStorage/asyncStorageKeys";
import { StoredItem } from "./asyncStorage/StoredItem";
import { RemoteService } from "./remoteService";

// last user logged in on this device, used while offline or until the server answers
const lastLoggedInUserStore = new StoredItem<ArenaUser | null>(
  asyncStorageKeys.loggedInUser,
  null,
);

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

const fetchLastLoggedInUser = (): Promise<ArenaUser | null> =>
  lastLoggedInUserStore.fetch();

const saveLastLoggedInUser = async (user: ArenaUser): Promise<void> => {
  await lastLoggedInUserStore.save(user);
};

const clearLastLoggedInUser = (): Promise<void> =>
  lastLoggedInUserStore.clear();

export const UserService = {
  fetchUser,
  fetchUserPicture,
  fetchLastLoggedInUser,
  saveLastLoggedInUser,
  clearLastLoggedInUser,
};

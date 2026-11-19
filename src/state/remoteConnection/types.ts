import { ArenaUser } from "@openforis/arena-core";

export type UserProfileIconInfo = {
  loaded: boolean;
  loading: boolean;
  uri?: string | null;
};

export type RemoteConnectionState = {
  user: ArenaUser | null;
  userLoading: boolean;
  // null once the user credentials are cleared
  userProfileIconInfo: UserProfileIconInfo | null;
};

import { User } from "@openforis/arena-core";

export type UserProfileIconInfo = {
  loaded: boolean;
  loading: boolean;
  uri?: string;
};

export type RemoteConnectionState = {
  user: User | null;
  userLoading: boolean;
  userProfileIconInfo: UserProfileIconInfo;
};

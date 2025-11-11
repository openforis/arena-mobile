import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";

import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
} from "state/remoteConnection";
import { useAppDispatch } from "state/store";

type UserProfileAvatarProps = {
  loading?: boolean;
  size?: number;
  uri?: string;
  user?: any;
};

const UserProfileAvatar = (props: UserProfileAvatarProps) => {
  const { loading, size, uri, user } = props;
  if (loading) return <Avatar.Icon icon="loading" size={size} />;
  if (uri) return <Avatar.Image source={{ uri }} size={size} />;
  const userName = user?.name;
  if (userName) {
    const userFirstLetter = userName.substring(0, 1).toLocaleUpperCase();
    return <Avatar.Text label={userFirstLetter} size={size} />;
  }
  return <Avatar.Icon icon="account-off" size={size} />;
};

type Props = {
  onPress?: () => void;
  size?: number;
};

export const UserProfileIcon = (props: Props) => {
  const { onPress, size = 30 } = props;
  if (__DEV__) console.log(`rendering UserProfileIcon`);

  const dispatch = useAppDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const iconInfo = RemoteConnectionSelectors.useLoggedInUserProfileIconInfo();
  const { loading, uri, loaded } = iconInfo ?? {};

  useEffect(() => {
    if (user && !loaded && !uri) {
      dispatch(RemoteConnectionActions.fetchLoggedInUserProfileIcon);
    }
  }, [dispatch, user, loaded, uri]);

  return (
    <TouchableOpacity onPress={onPress}>
      <UserProfileAvatar loading={loading} size={size} uri={uri} user={user} />
    </TouchableOpacity>
  );
};

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import {
  RemoteConnectionActions,
  RemoteConnectionSelectors,
} from "state/remoteConnection";

const UserProfileAvatar = (props: any) => {
  const { loading, size, uri, user } = props;
  if (loading) return <Avatar.Icon icon="loading" size={size} />;
  if (uri) return <Avatar.Image source={{ uri }} size={size} />;
  if (user) {
    const userFirstLetter = user?.name.substring(0, 1).toLocaleUpperCase();
    return <Avatar.Text label={userFirstLetter} size={size} />;
  }
  return <Avatar.Icon icon="account-off" size={size} />;
};

UserProfileAvatar.propTypes = {
  loading: PropTypes.bool,
  size: PropTypes.number,
  uri: PropTypes.string,
  user: PropTypes.object,
};

export const UserProfileIcon = (props: any) => {
  const { onPress, size = 30 } = props;
  if (__DEV__) console.log(`rendering UserProfileIcon`);

  const dispatch = useDispatch();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const iconInfo = RemoteConnectionSelectors.useLoggedInUserProfileIconInfo();
  const { loading, uri, loaded } = iconInfo ?? {};

  useEffect(() => {
    if (user && !loaded && !uri) {
      // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
      dispatch(RemoteConnectionActions.fetchLoggedInUserProfileIcon);
    }
  }, [dispatch, user, loaded, uri]);

  return (
    <TouchableOpacity onPress={onPress}>
      <UserProfileAvatar loading={loading} size={size} uri={uri} user={user} />
    </TouchableOpacity>
  );
};

UserProfileIcon.propTypes = {
  onPress: PropTypes.func,
  size: PropTypes.number,
};

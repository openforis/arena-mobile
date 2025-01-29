import { AppService } from "service/appService";
import { RemoteConnectionActions } from "./actions";

const { confirmGoToConnectionToRemoteServer } = RemoteConnectionActions;

const checkLoggedInUser = async ({ dispatch, navigation }) => {
  if (await AppService.checkLoggedInUser()) return true;

  dispatch(confirmGoToConnectionToRemoteServer({ navigation }));
  return false;
};

export const RemoteConnectionUtils = {
  checkLoggedInUser,
};

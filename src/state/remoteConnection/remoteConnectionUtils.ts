// @ts-expect-error TS(2307): Cannot find module 'service/appService' or its cor... Remove this comment to see the full error message
import { AppService } from "service/appService";
import { RemoteConnectionActions } from "./actions";

const { confirmGoToConnectionToRemoteServer } = RemoteConnectionActions;

const checkLoggedInUser = async ({
  dispatch,
  navigation
}: any) => {
  if (await AppService.checkLoggedInUser()) {
    return true;
  }

  dispatch(confirmGoToConnectionToRemoteServer({ navigation }));
  return false;
};

export const RemoteConnectionUtils = {
  checkLoggedInUser,
};

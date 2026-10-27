import { AppService } from "service/appService";
import { RemoteConnectionActions } from "./actions";

const { confirmGoToConnectionToRemoteServer } = RemoteConnectionActions;

const checkLoggedInUser = async ({ dispatch, navigator }: any) => {
  if (await AppService.checkLoggedInUser()) {
    return true;
  }

  dispatch(confirmGoToConnectionToRemoteServer({ navigator }));
  return false;
};

export const RemoteConnectionUtils = {
  checkLoggedInUser,
};

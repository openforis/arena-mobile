import { AppService } from "service/app/appService";
import type { Navigator } from "navigation/navigator";
import { RemoteConnectionActions } from "./actions";
import type { AppDispatch } from "../store";

const { confirmGoToConnectionToRemoteServer } = RemoteConnectionActions;

const checkLoggedInUser = async ({
  dispatch,
  navigator,
}: {
  dispatch: AppDispatch;
  navigator: Navigator;
}) => {
  if (await AppService.checkLoggedInUser()) {
    return true;
  }

  dispatch(confirmGoToConnectionToRemoteServer({ navigator }));
  return false;
};

export const RemoteConnectionUtils = {
  checkLoggedInUser,
};

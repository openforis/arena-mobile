import { useCallback, useState } from "react";

import { SettingsService } from "service";
import { MessageActions, useAppDispatch } from "state";
import { AMConstants } from "utils";

import { getServerUrlType, ServerUrlType } from "./remoteConnectionUtils";

type ServerUrlFormState = {
  serverUrl: string;
  serverUrlType: ServerUrlType;
  serverUrlVerified: boolean;
};

export const useServerUrlForm = () => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<ServerUrlFormState>({
    serverUrl: AMConstants.defaultServerUrl,
    serverUrlType: ServerUrlType.default,
    serverUrlVerified: false,
  });
  const { serverUrl } = state;

  // server url stored in the settings
  const setStoredServerUrl = useCallback(
    (serverUrlStored: string) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrl: serverUrlStored,
        serverUrlType: getServerUrlType(serverUrlStored),
      })),
    [],
  );

  const onServerUrlTypeChange = useCallback(
    (type: string) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrlType: type as ServerUrlType,
        serverUrl:
          type === ServerUrlType.default
            ? AMConstants.defaultServerUrl
            : statePrev.serverUrl,
        serverUrlVerified: false,
      })),
    [],
  );

  const onServerUrlChange = useCallback(
    (serverUrlUpdated: string) =>
      setState((statePrev) => ({
        ...statePrev,
        serverUrl: serverUrlUpdated.trim(),
        serverUrlVerified: false,
      })),
    [],
  );

  const onTestUrlPress = useCallback(async () => {
    const valid = await SettingsService.testServerUrl(serverUrl);
    setState((statePrev) => ({ ...statePrev, serverUrlVerified: valid }));
    if (!valid) {
      dispatch(
        MessageActions.setMessage({
          content: "settingsRemoteConnection:serverUrlNotValid",
        }),
      );
    }
  }, [dispatch, serverUrl]);

  return {
    ...state,
    setStoredServerUrl,
    onServerUrlTypeChange,
    onServerUrlChange,
    onTestUrlPress,
  };
};

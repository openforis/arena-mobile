import { useCallback, useState } from "react";

import { invalidTwoFactorCodeError, LoginResponse } from "service/authService";

import {
  toTwoFactorToken,
  twoFactorInitialState,
  TwoFactorState,
  twoFactorStateAfterLogin,
} from "./remoteConnectionUtils";
import { twoFactorCodeLength } from "./TwoFactorVerification";

// login, entering the two-step verification when the server requires it
export const useTwoFactorLogin = ({
  loading,
  setLoading,
  loginWithToken,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  // starts the login (setting loading) and returns its result
  loginWithToken: (twoFactorToken?: string) => Promise<LoginResponse>;
}) => {
  const [state, setState] = useState<TwoFactorState>(twoFactorInitialState);
  const { backupCodeMode, twoFactorCode } = state;

  const login = useCallback(
    async (twoFactorToken?: string) => {
      const res = await loginWithToken(twoFactorToken);
      // set together with the two-step verification state, not to show the login form in between
      setLoading(false);
      setState((statePrev) =>
        twoFactorStateAfterLogin({
          state: statePrev,
          loggedIn: !!res.user,
          twoFactorRequired: !!res.twoFactorRequired,
          codeNotValid: res.error === invalidTwoFactorCodeError,
        }),
      );
      return res;
    },
    [loginWithToken, setLoading],
  );

  const onTwoFactorCodeChange = useCallback(
    (code: string) => {
      if (loading) return;
      setState((statePrev) => ({
        ...statePrev,
        twoFactorCode: code,
        twoFactorCodeNotValid: false,
      }));
      if (!backupCodeMode && code.length === twoFactorCodeLength) {
        login(code);
      }
    },
    [backupCodeMode, loading, login],
  );

  const onTwoFactorVerify = useCallback(
    () => login(toTwoFactorToken({ code: twoFactorCode, backupCodeMode })),
    [backupCodeMode, login, twoFactorCode],
  );

  const onTwoFactorGoBack = useCallback(
    () => setState(twoFactorInitialState),
    [],
  );

  const onBackupCodeModeToggle = useCallback(
    () =>
      setState((statePrev) => ({
        ...statePrev,
        backupCodeMode: !statePrev.backupCodeMode,
        twoFactorCode: "",
        twoFactorCodeNotValid: false,
      })),
    [],
  );

  return {
    ...state,
    login,
    onTwoFactorCodeChange,
    onTwoFactorVerify,
    onTwoFactorGoBack,
    onBackupCodeModeToggle,
  };
};

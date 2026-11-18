import { Objects } from "@openforis/arena-core";

import { AMConstants } from "utils/AMConstants";

export const ServerUrlType = {
  default: "default",
  custom: "custom",
} as const;

export type ServerUrlType = (typeof ServerUrlType)[keyof typeof ServerUrlType];

export const getServerUrlType = (serverUrl: string): ServerUrlType =>
  serverUrl === AMConstants.defaultServerUrl
    ? ServerUrlType.default
    : ServerUrlType.custom;

export const normalizeEmail = (email: string): string =>
  email.trim().toLocaleLowerCase();

export const isLoginDisabled = ({
  networkAvailable,
  email,
  password,
}: {
  networkAvailable: boolean;
  email: string;
  password: string;
}): boolean =>
  !networkAvailable ||
  Objects.isEmpty(email.trim()) ||
  Objects.isEmpty(password);

export type TwoFactorState = {
  twoFactorRequired: boolean;
  backupCodeMode: boolean;
  twoFactorCode: string;
  twoFactorCodeNotValid: boolean;
};

export const twoFactorInitialState: TwoFactorState = {
  twoFactorRequired: false,
  backupCodeMode: false,
  twoFactorCode: "",
  twoFactorCodeNotValid: false,
};

// two-step verification state after a login attempt
export const twoFactorStateAfterLogin = ({
  state,
  loggedIn,
  twoFactorRequired,
  codeNotValid,
}: {
  state: TwoFactorState;
  loggedIn: boolean;
  twoFactorRequired: boolean;
  codeNotValid: boolean;
}): TwoFactorState => {
  if (loggedIn) return twoFactorInitialState;
  return {
    ...state,
    // stay in the two-step verification on other errors (e.g. network errors)
    twoFactorRequired: state.twoFactorRequired || twoFactorRequired,
    twoFactorCode: codeNotValid ? "" : state.twoFactorCode,
    twoFactorCodeNotValid: codeNotValid,
  };
};

// backup codes are case insensitive and can be typed with surrounding spaces
export const toTwoFactorToken = ({
  code,
  backupCodeMode,
}: {
  code: string;
  backupCodeMode: boolean;
}): string => (backupCodeMode ? code.trim().toUpperCase() : code);

export const parseLoginQrCodeData = (
  data: string,
): { serverUrl: string; token: string } => {
  try {
    const { serverUrl, token } = JSON.parse(data);
    if (
      typeof serverUrl === "string" &&
      typeof token === "string" &&
      Objects.isNotEmpty(serverUrl) &&
      Objects.isNotEmpty(token)
    ) {
      return { serverUrl, token };
    }
  } catch {
    // ignore error
  }
  throw new Error("Invalid QR code data structure");
};

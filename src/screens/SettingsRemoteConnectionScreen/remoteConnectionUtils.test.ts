import { AMConstants } from "utils/AMConstants";

import {
  getServerUrlType,
  isLoginDisabled,
  normalizeEmail,
  parseLoginQrCodeData,
  ServerUrlType,
  toTwoFactorToken,
  twoFactorInitialState,
  TwoFactorState,
  twoFactorStateAfterLogin,
} from "./remoteConnectionUtils";

describe("getServerUrlType", () => {
  test("default only for the default server url", () => {
    expect(getServerUrlType(AMConstants.defaultServerUrl)).toBe(
      ServerUrlType.default,
    );
    expect(getServerUrlType("https://arena.example.org")).toBe(
      ServerUrlType.custom,
    );
  });
});

describe("normalizeEmail", () => {
  test("trims and lower cases", () => {
    expect(normalizeEmail("  John.Doe@Example.ORG ")).toBe(
      "john.doe@example.org",
    );
  });
});

describe("isLoginDisabled", () => {
  const params = {
    networkAvailable: true,
    email: "user@example.org",
    password: "secret",
  };

  test("enabled with network, email and password", () => {
    expect(isLoginDisabled(params)).toBe(false);
  });

  test("disabled offline or without credentials", () => {
    expect(isLoginDisabled({ ...params, networkAvailable: false })).toBe(true);
    expect(isLoginDisabled({ ...params, email: "   " })).toBe(true);
    expect(isLoginDisabled({ ...params, password: "" })).toBe(true);
  });
});

describe("twoFactorStateAfterLogin", () => {
  const verifying: TwoFactorState = {
    twoFactorRequired: true,
    backupCodeMode: false,
    twoFactorCode: "123456",
    twoFactorCodeNotValid: false,
  };

  test("reset once logged in", () => {
    expect(
      twoFactorStateAfterLogin({
        state: verifying,
        loggedIn: true,
        twoFactorRequired: false,
        codeNotValid: false,
      }),
    ).toEqual(twoFactorInitialState);
  });

  test("enters the two-step verification when required", () => {
    expect(
      twoFactorStateAfterLogin({
        state: twoFactorInitialState,
        loggedIn: false,
        twoFactorRequired: true,
        codeNotValid: false,
      }).twoFactorRequired,
    ).toBe(true);
  });

  test("clears an invalid code", () => {
    expect(
      twoFactorStateAfterLogin({
        state: verifying,
        loggedIn: false,
        twoFactorRequired: false,
        codeNotValid: true,
      }),
    ).toEqual({ ...verifying, twoFactorCode: "", twoFactorCodeNotValid: true });
  });

  test("stays in the two-step verification on other errors", () => {
    expect(
      twoFactorStateAfterLogin({
        state: verifying,
        loggedIn: false,
        twoFactorRequired: false,
        codeNotValid: false,
      }),
    ).toEqual(verifying);
  });
});

describe("toTwoFactorToken", () => {
  test("backup codes trimmed and upper cased", () => {
    expect(toTwoFactorToken({ code: " ab12cd ", backupCodeMode: true })).toBe(
      "AB12CD",
    );
  });

  test("authenticator codes as typed", () => {
    expect(toTwoFactorToken({ code: "123456", backupCodeMode: false })).toBe(
      "123456",
    );
  });
});

describe("parseLoginQrCodeData", () => {
  test("server url and token", () => {
    expect(
      parseLoginQrCodeData(
        JSON.stringify({ serverUrl: "https://arena.example.org", token: "t" }),
      ),
    ).toEqual({ serverUrl: "https://arena.example.org", token: "t" });
  });

  test("throws on invalid data", () => {
    expect(() => parseLoginQrCodeData("not json")).toThrow();
    expect(() =>
      parseLoginQrCodeData(JSON.stringify({ serverUrl: "", token: "t" })),
    ).toThrow();
    expect(() =>
      parseLoginQrCodeData(JSON.stringify({ serverUrl: "x", token: 1 })),
    ).toThrow();
  });
});

import { JobStatus } from "@openforis/arena-core";

import {
  errorOrJobToString,
  errorTextLooksLikeAuthError,
  isAuthError,
} from "./dataExportUtils";

jest.mock("utils", () => ({ log: { warn: jest.fn() } }));
jest.mock("../autoSync", () => ({ AutoSyncActions: {} }));
jest.mock("../message", () => ({ MessageActions: {} }));

describe("errorOrJobToString", () => {
  test("empty values", () => {
    expect(errorOrJobToString(null)).toBe("");
    expect(errorOrJobToString(undefined)).toBe("");
  });

  test("Error uses its message", () => {
    expect(errorOrJobToString(new Error("boom"))).toBe("boom");
  });

  test("failed job is serialized as its errors", () => {
    const errors = { e1: { key: "k", params: { text: "t" } } };
    expect(
      errorOrJobToString({ status: JobStatus.failed, errors, other: 1 }),
    ).toBe(JSON.stringify(errors));
  });

  test("other jobs/objects are serialized whole", () => {
    const job = { status: JobStatus.succeeded, result: 1 };
    expect(errorOrJobToString(job)).toBe(JSON.stringify(job));
  });
});

describe("errorTextLooksLikeAuthError", () => {
  test("matches status code 401 as a whole word", () => {
    expect(
      errorTextLooksLikeAuthError("Request failed with status code 401"),
    ).toBe(true);
    expect(errorTextLooksLikeAuthError('{"text":"status code 401."}')).toBe(
      true,
    );
  });

  test("does not match other codes or partial numbers", () => {
    expect(errorTextLooksLikeAuthError("status code 403")).toBe(false);
    expect(errorTextLooksLikeAuthError("status code 4012")).toBe(false);
    expect(errorTextLooksLikeAuthError("401")).toBe(false);
    expect(errorTextLooksLikeAuthError("")).toBe(false);
  });
});

describe("isAuthError", () => {
  test("axios-like error with response status 401", () => {
    expect(isAuthError({ response: { status: 401 } })).toBe(true);
    expect(isAuthError({ response: { status: 500 } })).toBe(false);
  });

  test("error with status 401", () => {
    expect(isAuthError({ status: 401 })).toBe(true);
  });

  test("Error whose message contains status code 401", () => {
    expect(isAuthError(new Error("Request failed with status code 401"))).toBe(
      true,
    );
    expect(isAuthError(new Error("Network Error"))).toBe(false);
  });

  test("failed job whose collapsed errors contain status code 401", () => {
    const job = {
      status: JobStatus.failed,
      errors: {
        error: {
          key: "appErrors:generic",
          params: { text: "Request failed with status code 401" },
        },
      },
    };
    expect(isAuthError(job)).toBe(true);
  });

  test("empty values", () => {
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
  });
});

import { randomBytes } from "node:crypto";

import {
  bytesToBase64Url,
  extractUrlQueryParams,
  filterMobileLoginProviders,
} from "./externalLoginUtils";

describe("externalLoginUtils", () => {
  test("encodes bytes as base64url without padding", () => {
    for (const length of [0, 1, 2, 3, 31, 32, 33]) {
      const bytes = randomBytes(length);
      expect(bytesToBase64Url(new Uint8Array(bytes))).toBe(
        bytes.toString("base64url"),
      );
    }
  });

  test("extracts the query params of an app URL", () => {
    expect(
      extractUrlQueryParams(
        "org.openforis.arena-mobile://external-login?code=a%2Bb.c&x=1+2#hash",
      ),
    ).toEqual({ code: "a+b.c", x: "1 2" });
    expect(extractUrlQueryParams("org.openforis.arena-mobile://x")).toEqual({});
  });

  test("keeps only the providers usable from the app", () => {
    expect(filterMobileLoginProviders({ error: "not a list" })).toEqual([]);
    expect(
      filterMobileLoginProviders([
        { id: "a", type: "google", label: "A", mobileLogin: true },
        { id: "b", type: "oidc", label: "B" },
        null,
      ]),
    ).toEqual([{ id: "a", type: "google", label: "A", mobileLogin: true }]);
  });
});

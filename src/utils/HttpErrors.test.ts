import { HttpErrors } from "./HttpErrors";

const responseError = (status: unknown) => ({ response: { status } });

describe("HttpErrors", () => {
  test("getResponseStatus", () => {
    expect(HttpErrors.getResponseStatus(responseError(401))).toBe(401);
    expect(HttpErrors.getResponseStatus(responseError("404"))).toBe(404);
    expect(HttpErrors.getResponseStatus({ status: 401 })).toBeUndefined();
    expect(HttpErrors.getResponseStatus(responseError("abc"))).toBeUndefined();
    expect(HttpErrors.getResponseStatus(undefined)).toBeUndefined();
    expect(HttpErrors.getResponseStatus(null)).toBeUndefined();
  });

  test("getStatus prefers error.status", () => {
    expect(HttpErrors.getStatus({ status: 426 })).toBe(426);
    expect(HttpErrors.getStatus(responseError(426))).toBe(426);
    expect(
      HttpErrors.getStatus({ status: 500, response: { status: 401 } }),
    ).toBe(500);
    expect(HttpErrors.getStatus({})).toBeUndefined();
  });

  test("isUnauthorizedResponse checks only the response status", () => {
    expect(HttpErrors.isUnauthorizedResponse(responseError(401))).toBe(true);
    expect(HttpErrors.isUnauthorizedResponse({ status: 401 })).toBe(false);
    expect(HttpErrors.isUnauthorizedResponse(responseError(403))).toBe(false);
    expect(HttpErrors.isUnauthorizedResponse(new Error("x"))).toBe(false);
  });

  test("isUnauthorized checks both error and response status", () => {
    expect(HttpErrors.isUnauthorized(responseError(401))).toBe(true);
    expect(HttpErrors.isUnauthorized({ status: 401 })).toBe(true);
    expect(
      HttpErrors.isUnauthorized({ status: 500, response: { status: 401 } }),
    ).toBe(true);
    expect(HttpErrors.isUnauthorized({ status: 500 })).toBe(false);
    expect(HttpErrors.isUnauthorized(undefined)).toBe(false);
  });

  test("isEndpointNotSupported", () => {
    expect(HttpErrors.isEndpointNotSupported(responseError(404))).toBe(true);
    expect(HttpErrors.isEndpointNotSupported(responseError(501))).toBe(true);
    expect(HttpErrors.isEndpointNotSupported(responseError(500))).toBe(false);
    expect(HttpErrors.isEndpointNotSupported({ status: 404 })).toBe(false);
    expect(HttpErrors.isEndpointNotSupported(new Error("network"))).toBe(false);
  });
});

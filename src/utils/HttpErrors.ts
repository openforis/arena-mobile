const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const NOT_IMPLEMENTED = 501;

type ErrorWithStatus =
  | {
      status?: unknown;
      response?: { status?: unknown } | null;
    }
  | null
  | undefined;

const asErrorWithStatus = (error: unknown): ErrorWithStatus =>
  typeof error === "object" ? (error as ErrorWithStatus) : undefined;

const toStatus = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const status = Number(value);
  return Number.isFinite(status) ? status : undefined;
};

// HTTP status of the response attached to an axios-like error
const getResponseStatus = (error: unknown): number | undefined =>
  toStatus(asErrorWithStatus(error)?.response?.status);

// status set directly on the error (e.g. wrapped errors) or else the response one
const getStatus = (error: unknown): number | undefined =>
  toStatus(asErrorWithStatus(error)?.status) ?? getResponseStatus(error);

const hasResponseStatus = (error: unknown, status: number): boolean =>
  getResponseStatus(error) === status;

// checks both error.status and error.response.status
const hasStatus = (error: unknown, status: number): boolean =>
  toStatus(asErrorWithStatus(error)?.status) === status ||
  hasResponseStatus(error, status);

const isUnauthorizedResponse = (error: unknown): boolean =>
  hasResponseStatus(error, UNAUTHORIZED);

const isUnauthorized = (error: unknown): boolean =>
  hasStatus(error, UNAUTHORIZED);

// returned by older servers not exposing the requested endpoint yet
const isEndpointNotSupported = (error: unknown): boolean => {
  const status = getResponseStatus(error);
  return status === NOT_FOUND || status === NOT_IMPLEMENTED;
};

export const HttpErrors = {
  getResponseStatus,
  getStatus,
  hasResponseStatus,
  hasStatus,
  isUnauthorizedResponse,
  isUnauthorized,
  isEndpointNotSupported,
};

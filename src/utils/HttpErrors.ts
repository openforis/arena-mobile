const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const NOT_IMPLEMENTED = 501;

const toStatus = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const status = Number(value);
  return Number.isFinite(status) ? status : undefined;
};

// HTTP status of the response attached to an axios-like error
const getResponseStatus = (error: any): number | undefined =>
  toStatus(error?.response?.status);

// status set directly on the error (e.g. wrapped errors) or else the response one
const getStatus = (error: any): number | undefined =>
  toStatus(error?.status) ?? getResponseStatus(error);

const hasResponseStatus = (error: any, status: number): boolean =>
  getResponseStatus(error) === status;

// checks both error.status and error.response.status
const hasStatus = (error: any, status: number): boolean =>
  toStatus(error?.status) === status || hasResponseStatus(error, status);

const isUnauthorizedResponse = (error: any): boolean =>
  hasResponseStatus(error, UNAUTHORIZED);

const isUnauthorized = (error: any): boolean => hasStatus(error, UNAUTHORIZED);

// returned by older servers not exposing the requested endpoint yet
const isEndpointNotSupported = (error: any): boolean => {
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

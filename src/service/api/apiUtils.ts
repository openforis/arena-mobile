import { Strings } from "@openforis/arena-core";

const objectToFormData = (obj: any) => Object.entries(obj).reduce((acc, [key, value]) => {
  const formDataValue = Array.isArray(value) ? JSON.stringify(value) : value;
  acc.append(key, formDataValue);
  return acc;
}, new FormData());

const getUrl = ({
  serverUrl,
  uri
}: any) => {
  const parts = [];
  parts.push(Strings.removeSuffix("/")(serverUrl));
  parts.push(Strings.removePrefix("/")(uri));
  return parts.join("/");
};

const getUrlWithParams = ({
  serverUrl,
  uri,
  params = {}
}: any) => {
  const requestParams = Object.entries(params).reduce((acc, [key, value]) => {
    // @ts-expect-error TS(2345): Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
    acc.append(key, value);
    return acc;
  }, new URLSearchParams());
  const requestParamsString = requestParams.toString();
  return (
    getUrl({ serverUrl, uri }) +
    (requestParamsString ? "?" + requestParamsString : "")
  );
};

export const APIUtils = {
  objectToFormData,
  getUrl,
  getUrlWithParams,
};

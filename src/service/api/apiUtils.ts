import { ArenaDictionary, Strings } from "@openforis/arena-core";

const objectToFormData = (obj: ArenaDictionary<unknown> = {}) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (value instanceof Blob) {
      acc.append(key, value);
      return acc;
    }

    // Handle React Native file objects (with uri, type, name)
    if (
      value &&
      typeof value === "object" &&
      "uri" in value &&
      "type" in value &&
      "name" in value
    ) {
      // React Native FormData accepts file descriptors
      acc.append(key, value as unknown as Blob);
      return acc;
    }

    const formDataValue = Array.isArray(value) ? JSON.stringify(value) : value;
    acc.append(key, formDataValue);
    return acc;
  }, new FormData());

const getUrl = ({ serverUrl, uri }: { serverUrl: string; uri: string }) =>
  [Strings.removeSuffix("/")(serverUrl), Strings.removePrefix("/")(uri)].join(
    "/",
  );

const getUrlWithParams = ({
  serverUrl,
  uri,
  data = {},
}: {
  serverUrl: string;
  uri: string;
  data?: ArenaDictionary<unknown>;
}) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    searchParams.append(key, String(value));
  }
  const requestParamsString = searchParams.toString();
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

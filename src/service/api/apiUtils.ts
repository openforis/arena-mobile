import { Strings } from "@openforis/arena-core";

const objectToFormData = (obj: any) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (value instanceof Blob) {
      acc.append(key, value);
      return acc;
    }

    if (value && typeof value === "object" && "blob" in value) {
      const { blob } = value as any;
      if (blob) {
        acc.append(key, blob as any);
        return acc;
      }
    }

    const formDataValue = Array.isArray(value) ? JSON.stringify(value) : value;
    acc.append(key, formDataValue);
    return acc;
  }, new FormData());

const getUrl = ({ serverUrl, uri }: any) =>
  [Strings.removeSuffix("/")(serverUrl), Strings.removePrefix("/")(uri)].join(
    "/",
  );

const getUrlWithParams = ({ serverUrl, uri, data = {} }: any) => {
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

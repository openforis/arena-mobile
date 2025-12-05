import { Linking } from "react-native";

const isValidUrl = async (url: string): Promise<boolean> =>
  Linking.canOpenURL(url);

const normalizeUrl = async (
  url: string | null | undefined
): Promise<string | null> => {
  if (!url || typeof url !== "string") return null;

  let normalized = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    normalized = `https://${url}`;
  }
  if (!(await isValidUrl(normalized))) {
    return null;
  }
  return normalized;
};

export const URLs = {
  isValidUrl,
  normalizeUrl,
};

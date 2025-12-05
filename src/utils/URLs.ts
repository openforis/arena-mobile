import { Linking } from "react-native";

const isValidUrl = (url: string) => {
  return Linking.canOpenURL(url);
};

const normalizeUrl = (url: string) => {
  let normalized = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    normalized = `https://${url}`;
  }
  if (!isValidUrl(normalized)) {
    throw new Error(`Invalid URL: ${url}`);
  }
  return normalized;
};

export const URLs = {
  isValidUrl,
  normalizeUrl,
};

import { Linking } from "react-native";

const isValidUrl = (url: string): Promise<boolean> => Linking.canOpenURL(url);

/**
 * Ensures a URL starts with http:// or https://, defaulting to https:// if no protocol is present
 * @param url The URL to normalize
 * @returns The normalized URL or null if the URL is invalid
 */
const normalizeUrl = async (
  url: string | null | undefined,
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

// survey links are opened only if http(s): other schemes, like javascript:, could run code in the web preview
const toHttpUrlOrNull = (url: string | null | undefined): string | null =>
  url && /^https?:\/\//i.test(url) ? url : null;

export const URLs = {
  isValidUrl,
  toHttpUrlOrNull,
  normalizeUrl,
};

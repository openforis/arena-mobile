// pure helpers of the sign-in with external providers (Google, Microsoft, OpenID Connect)

// registered as the app URL scheme (app.config.ts) and accepted by the server as the only redirect URI of the app
export const externalLoginRedirectUri =
  "org.openforis.arena-mobile://external-login";

export type ExternalLoginProvider = {
  id: string;
  type: string;
  label: string;
  iconKind?: "builtin" | "uploaded" | "generic";
};

const base64Chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const bytesToBase64 = (bytes: Uint8Array): string => {
  const charAt = (index: number) => base64Chars.charAt(index & 63);
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const triplet =
      ((bytes[i] ?? 0) << 16) |
      ((bytes[i + 1] ?? 0) << 8) |
      (bytes[i + 2] ?? 0);
    result += charAt(triplet >> 18) + charAt(triplet >> 12);
    result += i + 1 < bytes.length ? charAt(triplet >> 6) : "=";
    result += i + 2 < bytes.length ? charAt(triplet) : "=";
  }
  return result;
};

export const base64ToBase64Url = (base64: string): string =>
  base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

export const bytesToBase64Url = (bytes: Uint8Array): string =>
  base64ToBase64Url(bytesToBase64(bytes));

// query params of a URL; URLSearchParams parsing is not available in every React Native version
export const extractUrlQueryParams = (url: string): Record<string, string> => {
  const queryStart = url.indexOf("?");
  if (queryStart < 0) return {};
  const hashStart = url.indexOf("#", queryStart);
  const query = url.substring(
    queryStart + 1,
    hashStart > 0 ? hashStart : undefined,
  );
  return query
    .split("&")
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const separatorIndex = part.indexOf("=");
      const decode = (value: string) =>
        decodeURIComponent(value.replaceAll("+", " "));
      const key = decode(
        separatorIndex >= 0 ? part.substring(0, separatorIndex) : part,
      );
      acc[key] =
        separatorIndex >= 0 ? decode(part.substring(separatorIndex + 1)) : "";
      return acc;
    }, {});
};

// providers that can be used from the app: servers released before the mobile flow do not set mobileLogin
export const filterMobileLoginProviders = (
  data: unknown,
): ExternalLoginProvider[] =>
  Array.isArray(data)
    ? data.filter(
        (provider) =>
          provider?.mobileLogin === true &&
          typeof provider.id === "string" &&
          typeof provider.label === "string",
      )
    : [];

export const getExternalLoginStartUri = ({
  providerId,
  codeChallenge,
}: {
  providerId: string;
  codeChallenge: string;
}): string =>
  `/auth/oidc/${encodeURIComponent(providerId)}?mobileCodeChallenge=${codeChallenge}`;

export const getExternalLoginProviderIconUri = (providerId: string): string =>
  `/auth/providers/${encodeURIComponent(providerId)}/icon`;

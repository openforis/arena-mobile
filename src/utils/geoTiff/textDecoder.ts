// geotiff.js decodes the ASCII tags with TextDecoder: minimal fallback where it is missing

class Utf8TextDecoder {
  readonly encoding = "utf-8";

  decode(input?: ArrayBufferView | ArrayBufferLike): string {
    if (!input) return "";
    const bytes = ArrayBuffer.isView(input)
      ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
      : new Uint8Array(input);
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]!;
      if (byte < 0x80) {
        result += String.fromCharCode(byte);
      } else if (byte >= 0xc0 && byte < 0xe0 && i + 1 < bytes.length) {
        result += String.fromCharCode(
          ((byte & 0x1f) << 6) | (bytes[++i]! & 0x3f),
        );
      } else if (byte >= 0xe0 && byte < 0xf0 && i + 2 < bytes.length) {
        result += String.fromCharCode(
          ((byte & 0x0f) << 12) |
            ((bytes[++i]! & 0x3f) << 6) |
            (bytes[++i]! & 0x3f),
        );
      } else {
        result += "�";
      }
    }
    return result;
  }
}

// returns true when the native TextDecoder is available
export const ensureTextDecoder = (): boolean => {
  if (typeof globalThis.TextDecoder === "function") return true;
  (globalThis as any).TextDecoder = Utf8TextDecoder;
  return false;
};

export const TextDecoderFallback = Utf8TextDecoder;

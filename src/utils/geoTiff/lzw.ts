// TIFF LZW decoder (MSB-first codes, "early change"): typed arrays and a preallocated output,
// several times faster than the geotiff.js one without a JIT (Hermes)

const CLEAR_CODE = 256;
const EOI_CODE = 257;
const FIRST_CODE = 258;
const MIN_CODE_LENGTH = 9;
const MAX_CODE_LENGTH = 12;
const DICTIONARY_SIZE = 1 << MAX_CODE_LENGTH;

export const decompressLzw = (
  input: ArrayBufferLike | Uint8Array,
  expectedSize = 0,
): Uint8Array => {
  const src = input instanceof Uint8Array ? input : new Uint8Array(input);
  const prefix = new Uint16Array(DICTIONARY_SIZE);
  const suffix = new Uint8Array(DICTIONARY_SIZE);
  const lengths = new Uint16Array(DICTIONARY_SIZE);
  const firstChar = new Uint8Array(DICTIONARY_SIZE);
  for (let i = 0; i < 256; i++) {
    suffix[i] = i;
    firstChar[i] = i;
    lengths[i] = 1;
  }
  let out = new Uint8Array(expectedSize > 0 ? expectedSize : src.length * 4);
  let outPos = 0;
  const ensureCapacity = (length: number) => {
    if (outPos + length <= out.length) return;
    const next = new Uint8Array(Math.max(out.length * 2, outPos + length));
    next.set(out.subarray(0, outPos));
    out = next;
  };
  // writes the string of the code at outPos (backwards, following the prefixes)
  const writeString = (code: number, length: number) => {
    let current = code;
    for (let p = outPos + length - 1; p >= outPos; p--) {
      out[p] = suffix[current]!;
      current = prefix[current]!;
    }
  };

  let bitBuffer = 0;
  let bitCount = 0;
  let srcPos = 0;
  let codeLength = MIN_CODE_LENGTH;
  let nextCode = FIRST_CODE;
  let oldCode = -1;

  while (true) {
    while (bitCount < codeLength) {
      if (srcPos >= src.length) {
        // input ended without EOI code
        return out.subarray(0, outPos);
      }
      bitBuffer = ((bitBuffer << 8) | src[srcPos]!) & 0xffffff;
      srcPos++;
      bitCount += 8;
    }
    const code =
      (bitBuffer >>> (bitCount - codeLength)) & ((1 << codeLength) - 1);
    bitCount -= codeLength;

    if (code === EOI_CODE) break;
    if (code === CLEAR_CODE) {
      codeLength = MIN_CODE_LENGTH;
      nextCode = FIRST_CODE;
      oldCode = -1;
      continue;
    }
    if (oldCode === -1) {
      if (code > 255) throw new Error(`LZW: invalid code ${code} after clear`);
      ensureCapacity(1);
      out[outPos++] = code;
      oldCode = code;
      continue;
    }
    let first: number;
    if (code < nextCode) {
      const length = lengths[code]!;
      ensureCapacity(length);
      writeString(code, length);
      outPos += length;
      first = firstChar[code]!;
    } else if (code === nextCode) {
      // code not in the dictionary yet: string of the old code + its first char
      const length = lengths[oldCode]! + 1;
      ensureCapacity(length);
      writeString(oldCode, length - 1);
      first = firstChar[oldCode]!;
      out[outPos + length - 1] = first;
      outPos += length;
    } else {
      throw new Error(`LZW: invalid code ${code}`);
    }
    if (nextCode < DICTIONARY_SIZE) {
      prefix[nextCode] = oldCode;
      suffix[nextCode] = first;
      lengths[nextCode] = lengths[oldCode]! + 1;
      firstChar[nextCode] = firstChar[oldCode]!;
      nextCode++;
    }
    oldCode = code;
    if (nextCode + 1 >= 1 << codeLength && codeLength < MAX_CODE_LENGTH) {
      codeLength++;
    }
  }
  return out.subarray(0, outPos);
};

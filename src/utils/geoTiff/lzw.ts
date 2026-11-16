// TIFF LZW decoder (MSB-first codes, "early change"): typed arrays and a preallocated output,
// several times faster than the geotiff.js one without a JIT (Hermes)

const CLEAR_CODE = 256;
const EOI_CODE = 257;
const FIRST_CODE = 258;
const MIN_CODE_LENGTH = 9;
const MAX_CODE_LENGTH = 12;
const DICTIONARY_SIZE = 1 << MAX_CODE_LENGTH;

const createDictionary = () => {
  const prefix = new Uint16Array(DICTIONARY_SIZE);
  const suffix = new Uint8Array(DICTIONARY_SIZE);
  const lengths = new Uint16Array(DICTIONARY_SIZE);
  const firstChar = new Uint8Array(DICTIONARY_SIZE);
  for (let i = 0; i < 256; i++) {
    suffix[i] = i;
    firstChar[i] = i;
    lengths[i] = 1;
  }
  return { prefix, suffix, lengths, firstChar };
};

export const decompressLzw = (
  input: ArrayBufferLike | Uint8Array,
  expectedSize = 0,
): Uint8Array => {
  const src = input instanceof Uint8Array ? input : new Uint8Array(input);
  const { prefix, suffix, lengths, firstChar } = createDictionary();
  let out = new Uint8Array(expectedSize > 0 ? expectedSize : src.length * 4);
  let outPos = 0;

  let bitBuffer = 0;
  let bitCount = 0;
  let srcPos = 0;
  let codeLength = MIN_CODE_LENGTH;
  let nextCode = FIRST_CODE;
  let oldCode = -1;

  // writes the string of the code and adds the new dictionary entry
  const decodeCode = (code: number) => {
    const firstAfterClear = oldCode === -1;
    if (firstAfterClear ? code > 255 : code > nextCode) {
      throw new Error(`LZW: invalid code ${code}`);
    }
    // code not in the dictionary yet: string of the old code + its first char
    const notInDictionary = !firstAfterClear && code === nextCode;
    const stringCode = notInDictionary ? oldCode : code;
    const length = lengths[stringCode]!;
    if (outPos + length + 1 > out.length) {
      const grown = new Uint8Array(
        Math.max(out.length * 2, outPos + length + 1),
      );
      grown.set(out.subarray(0, outPos));
      out = grown;
    }
    // backwards, following the prefixes
    let current = stringCode;
    for (let p = outPos + length - 1; p >= outPos; p--) {
      out[p] = suffix[current]!;
      current = prefix[current]!;
    }
    outPos += length;
    const first = firstChar[stringCode]!;
    if (notInDictionary) out[outPos++] = first;
    if (!firstAfterClear && nextCode < DICTIONARY_SIZE) {
      prefix[nextCode] = oldCode;
      suffix[nextCode] = first;
      lengths[nextCode] = lengths[oldCode]! + 1;
      firstChar[nextCode] = firstChar[oldCode]!;
      nextCode++;
      if (nextCode + 1 >= 1 << codeLength && codeLength < MAX_CODE_LENGTH) {
        codeLength++;
      }
    }
    oldCode = code;
  };

  // bits read inline (not in a function): it runs for every code
  while (srcPos < src.length || bitCount >= codeLength) {
    while (bitCount < codeLength && srcPos < src.length) {
      bitBuffer = ((bitBuffer << 8) | src[srcPos]!) & 0xffffff;
      srcPos++;
      bitCount += 8;
    }
    if (bitCount < codeLength) break;
    bitCount -= codeLength;
    const code = (bitBuffer >>> bitCount) & ((1 << codeLength) - 1);
    if (code === EOI_CODE) break;
    if (code === CLEAR_CODE) {
      codeLength = MIN_CODE_LENGTH;
      nextCode = FIRST_CODE;
      oldCode = -1;
    } else {
      decodeCode(code);
    }
  }
  // input ended (with or without the EOI code)
  return out.subarray(0, outPos);
};

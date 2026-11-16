import { decompressLzw } from "./lzw";

// TIFF LZW encoder (MSB-first, early change, clear code when the dictionary is full)
const compressLzw = (data: Uint8Array): Uint8Array => {
  const bytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;
  let codeLength = 9;
  const writeCode = (code: number) => {
    bitBuffer = (bitBuffer << codeLength) | code;
    bitCount += codeLength;
    while (bitCount >= 8) {
      bytes.push((bitBuffer >>> (bitCount - 8)) & 0xff);
      bitCount -= 8;
    }
    bitBuffer &= (1 << bitCount) - 1;
  };
  let dictionary = new Map<string, number>();
  let nextCode = 258;
  writeCode(256);
  let current = "";
  for (const byte of data) {
    const candidate = current ? `${current},${byte}` : `${byte}`;
    if (current === "" || dictionary.has(candidate)) {
      current = candidate;
      continue;
    }
    writeCode(
      current.includes(",") ? dictionary.get(current)! : Number(current),
    );
    dictionary.set(candidate, nextCode++);
    if (nextCode === 4094) {
      writeCode(256);
      dictionary = new Map();
      nextCode = 258;
      codeLength = 9;
    } else if (nextCode === 1 << codeLength) {
      codeLength++;
    }
    current = `${byte}`;
  }
  if (current) {
    writeCode(
      current.includes(",") ? dictionary.get(current)! : Number(current),
    );
    // the decoder adds an entry for this code too: it can increase the code length
    nextCode++;
    if (nextCode === 1 << codeLength && codeLength < 12) codeLength++;
  }
  writeCode(257);
  if (bitCount > 0) bytes.push((bitBuffer << (8 - bitCount)) & 0xff);
  return new Uint8Array(bytes);
};

// deterministic pseudo-random data with repetitions (compressible, many dictionary entries)
const generateData = (length: number, seed = 1): Uint8Array => {
  const data = new Uint8Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    data[i] = i % 7 === 0 ? (state >>> 16) & 0xff : (i >>> 5) & 0x0f;
  }
  return data;
};

describe("decompressLzw", () => {
  it("decodes a short sequence", () => {
    const data = new TextEncoder().encode("TOBEORNOTTOBEORTOBEORNOT");
    expect(decompressLzw(compressLzw(data))).toEqual(data);
  });

  it("decodes data that needs codes of all lengths and clear codes", () => {
    const data = generateData(200000);
    const decoded = decompressLzw(compressLzw(data), data.length);
    expect(decoded).toHaveLength(data.length);
    expect(decoded).toEqual(data);
  });

  it("grows the output when the expected size is too small", () => {
    const data = generateData(10000, 7);
    expect(decompressLzw(compressLzw(data), 10)).toEqual(data);
  });

  it("decodes runs of the same byte (code not yet in the dictionary)", () => {
    const data = new Uint8Array(5000).fill(42);
    expect(decompressLzw(compressLzw(data))).toEqual(data);
  });

  it("stops at the end of the input when the EOI code is missing", () => {
    const data = generateData(1000);
    const compressed = compressLzw(data);
    const decoded = decompressLzw(
      compressed.subarray(0, compressed.length - 2),
    );
    expect(decoded).toEqual(data.subarray(0, decoded.length));
  });
});

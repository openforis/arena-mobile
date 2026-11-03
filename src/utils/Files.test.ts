import { Files } from "./Files";

const mockWrites: { uri: string; content: any }[] = [];
let mockFileBytes = new Uint8Array();

jest.mock("mime", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: async () => ({ exists: true }),
  writeAsStringAsync: async (uri: string, content: string) => {
    mockWrites.push({ uri, content });
  },
}));
jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
    bytes = async () => mockFileBytes;
    write = async (content: any) => {
      mockWrites.push({ uri: this.uri, content });
    };
  },
}));
jest.mock("./Environment", () => ({ Environment: { isExpoGo: true } }));

beforeEach(() => {
  mockWrites.length = 0;
});

describe("Files.writeBytesToFile", () => {
  it("writes the bytes replacing the file content", async () => {
    const bytes = new Uint8Array([1]);
    await Files.writeBytesToFile({ fileUri: "file:///chunk.tmp", bytes });
    expect(mockWrites).toEqual([{ uri: "file:///chunk.tmp", content: bytes }]);
  });
});

describe("Files.readAsBytes", () => {
  it("returns the file bytes", async () => {
    mockFileBytes = new Uint8Array([1, 2]);
    expect(await Files.readAsBytes("file:///a")).toEqual(mockFileBytes);
  });

  it("returns null for an empty file", async () => {
    mockFileBytes = new Uint8Array();
    expect(await Files.readAsBytes("file:///a")).toBeNull();
  });
});

describe("Files.writeJsonToFile", () => {
  it("writes compact JSON", async () => {
    await Files.writeJsonToFile({ content: { a: 1 }, fileUri: "file:///a" });
    expect(mockWrites).toEqual([{ uri: "file:///a", content: '{"a":1}' }]);
  });
});

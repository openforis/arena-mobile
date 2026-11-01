import { Files } from "./Files";

const mockEvents: string[] = [];
const mockFileHandle = {
  writeBytes: async () => {
    await Promise.resolve();
    mockEvents.push("written");
  },
  close: () => mockEvents.push("closed"),
};

jest.mock("mime", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: async () => ({ exists: true }),
}));
jest.mock("expo-file-system", () => ({
  File: class {
    open = () => mockFileHandle;
  },
}));
jest.mock("./Environment", () => ({ Environment: { isExpoGo: true } }));

describe("Files.writeBytesToFile", () => {
  it("closes the file only after the bytes are written", async () => {
    await Files.writeBytesToFile({
      fileUri: "file:///chunk.tmp",
      bytes: new Uint8Array([1]),
    });
    expect(mockEvents).toEqual(["written", "closed"]);
  });
});

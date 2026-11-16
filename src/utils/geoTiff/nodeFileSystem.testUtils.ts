import fs from "node:fs";
import path from "node:path";

// expo-file-system File / FileHandle mock reading files with node fs:
// jest.mock("expo-file-system", () => require("utils/geoTiff/nodeFileSystem.testUtils"))

class FileHandle {
  offset = 0;
  readonly size: number;
  private readonly fd: number;

  constructor(filePath: string) {
    this.fd = fs.openSync(filePath, "r");
    this.size = fs.fstatSync(this.fd).size;
  }

  readBytes(length: number): Promise<Uint8Array> {
    const bytes = new Uint8Array(length);
    const read = fs.readSync(this.fd, bytes, 0, length, this.offset);
    this.offset += read;
    return Promise.resolve(bytes.subarray(0, read));
  }

  close() {
    fs.closeSync(this.fd);
  }
}

export class File {
  constructor(private readonly uri: string) {}

  open() {
    return new FileHandle(this.uri);
  }
}

export const GEOTIFF_FIXTURES_DIR = path.join(__dirname, "__fixtures__");

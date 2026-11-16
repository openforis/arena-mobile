import type { ImportedMapSourceType } from "model/ImportedMap";

// type of an imported map file from its first bytes (file pickers don't always report .tif files as image/tiff)

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF
const TIFF_SIGNATURES = [
  [0x49, 0x49, 0x2a, 0x00], // II*\0 (little endian)
  [0x4d, 0x4d, 0x00, 0x2a], // MM\0* (big endian)
  [0x49, 0x49, 0x2b, 0x00], // BigTIFF, little endian
  [0x4d, 0x4d, 0x00, 0x2b], // BigTIFF, big endian
];

export const FILE_TYPE_HEADER_LENGTH = 4;

const startsWith = (bytes: Uint8Array, signature: number[]): boolean =>
  signature.every((value, index) => bytes[index] === value);

export const detectMapFileType = (
  header: Uint8Array,
): ImportedMapSourceType | null => {
  if (startsWith(header, PDF_SIGNATURE)) return "pdf";
  if (TIFF_SIGNATURES.some((signature) => startsWith(header, signature))) {
    return "geotiff";
  }
  return null;
};

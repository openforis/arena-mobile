import type { MapTileOverlay } from "components";
import type { ImportedMapPageCandidate, ImportedMapPreview } from "service";

export type ToastMessage = {
  key: string;
  params?: Record<string, unknown>;
};

// details of an error thrown by a job (job summary with errors) or by any other code
export const extractErrorDetails = (error: unknown): string => {
  const errors =
    error && typeof error === "object" && "errors" in error
      ? error.errors
      : undefined;
  if (errors && typeof errors === "object") {
    const firstError: unknown = Object.values(errors)[0];
    if (firstError) {
      const { error: errorMessage, key } = firstError as {
        error?: unknown;
        key?: unknown;
      };
      const details = errorMessage ?? key ?? firstError;
      return typeof details === "string" ? details : JSON.stringify(details);
    }
  }
  return error instanceof Error ? error.message : String(error);
};

export const toPageItems = (
  candidates: ImportedMapPageCandidate[],
): { value: string; label: string }[] =>
  candidates.map((item, index) => ({
    value: String(index),
    label: item.viewportName
      ? `${item.pageIndex + 1} - ${item.viewportName}`
      : String(item.pageIndex + 1),
  }));

export const toPreviewTileOverlays = (
  preview: ImportedMapPreview | null,
): MapTileOverlay[] | undefined =>
  preview
    ? [
        {
          key: preview.id,
          tilesPath: preview.tilesPath,
          minZoom: preview.minZoom,
          maxZoom: preview.maxZoom,
        },
      ]
    : undefined;

// the tiles of the map always include the min zoom level of the page
export const getImportMinZoom = ({
  candidate,
  maxZoom,
}: {
  candidate: ImportedMapPageCandidate;
  maxZoom: number;
}): number => Math.min(candidate.zoomRange.minZoom, maxZoom);

// message explaining why the import cannot start, null if it can
export const getImportBlockingMessage = ({
  nameErrorKey,
  exceedsMaxTiles,
  exceedsFreeSpace,
  maxTiles,
}: {
  nameErrorKey: string | null;
  exceedsMaxTiles: boolean;
  exceedsFreeSpace: boolean;
  maxTiles: number;
}): ToastMessage | null => {
  if (nameErrorKey) return { key: nameErrorKey };
  if (exceedsMaxTiles)
    return { key: "importedMaps:import.tooManyTiles", params: { maxTiles } };
  if (exceedsFreeSpace) return { key: "importedMaps:import.notEnoughSpace" };
  return null;
};

export const isImportDisabled = ({
  importing,
  exceedsMaxTiles,
  exceedsFreeSpace,
}: {
  importing: boolean;
  exceedsMaxTiles: boolean;
  exceedsFreeSpace: boolean;
}): boolean => importing || exceedsMaxTiles || exceedsFreeSpace;

export const getEstimateTextKey = (exceedsMaxTiles: boolean): string =>
  exceedsMaxTiles
    ? "importedMaps:import.estimateTooManyTiles"
    : "importedMaps:import.estimate";

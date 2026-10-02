import { OfflineMapArea } from "model/OfflineMapArea";

const nameErrorKeys = {
  required: "offlineMaps:area.nameRequired",
  duplicate: "offlineMaps:area.nameDuplicate",
};

const normalizeName = (name: string): string => name.trim().toLowerCase();

// returns the translation key of the error, or null if the name is valid;
// names are compared ignoring case and leading/trailing spaces
const validateName = ({
  name,
  areas,
  areaId,
}: {
  name: string;
  // existing areas
  areas: OfflineMapArea[];
  // id of the area being renamed (it is not compared with itself)
  areaId?: string;
}): string | null => {
  const nameNormalized = normalizeName(name);
  if (!nameNormalized) return nameErrorKeys.required;

  const duplicate = areas.some(
    (area) => area.id !== areaId && normalizeName(area.name) === nameNormalized,
  );
  return duplicate ? nameErrorKeys.duplicate : null;
};

export const OfflineMapAreaValidator = {
  nameErrorKeys,
  validateName,
};

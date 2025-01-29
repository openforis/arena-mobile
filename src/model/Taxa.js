import { NodeDefs } from "@openforis/arena-core";

const unlistedCode = "UNL";
const unknownCode = "UNK";

const taxonToString = ({ nodeDef, taxon }) => {
  if (!nodeDef || !taxon) return null;

  const { code, scientificName } = taxon.props;
  const {
    scientificName: scientificNameUnlisted,
    vernacularName,
    vernacularNameLangCode,
  } = taxon;

  const visibleFields = NodeDefs.getVisibleFields(nodeDef);
  const codeVisible = !visibleFields || visibleFields.includes("code");
  const vernacularNameVisible =
    !visibleFields || visibleFields.includes("vernacularName");

  const scientificNameShown = scientificNameUnlisted ?? scientificName;

  const vernacularNamePart =
    !vernacularName || !vernacularNameVisible
      ? ""
      : `${vernacularName} (${vernacularNameLangCode})`;

  const codePart = codeVisible ? `(${code})` : "";

  return {
    fullText: `${scientificNameShown} ${codePart}
${vernacularNamePart}`,
    scientificNameAndCode: `${scientificNameShown} ${codePart}`,
    vernacularNamePart,
  };
};

export const Taxa = {
  unlistedCode,
  unknownCode,
  taxonToString,
};

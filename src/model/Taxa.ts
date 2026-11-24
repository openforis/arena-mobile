import { ArenaAnyNodeDef, ArenaTaxon, NodeDefs } from "@openforis/arena-core";

import { LanguageUtils } from "utils/LanguageUtils";

const unlistedCode = "UNL";
const unknownCode = "UNK";

// unlisted taxa (UNL) have the scientific name in the node value; vernacular name optionally selected
type TaxonWithSelectedNames = ArenaTaxon & {
  scientificName?: string;
  vernacularName?: string;
  vernacularNameLangCode?: string;
};

const taxonToString = ({
  nodeDef,
  taxon,
}: {
  nodeDef: ArenaAnyNodeDef | null | undefined;
  taxon: TaxonWithSelectedNames | null | undefined;
}): {
  fullText: string;
  scientificNameAndCode: string;
  vernacularNamePart: string;
} | null => {
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
      : `${vernacularName} (${LanguageUtils.getLanguageLabel(vernacularNameLangCode)})`;

  const codePart = codeVisible ? `(${code})` : "";

  return {
    fullText: `${scientificNameShown} ${codePart}
${vernacularNamePart}`,
    scientificNameAndCode: `${scientificNameShown} ${codePart}`,
    vernacularNamePart,
  };
};

export const Taxa = { unlistedCode, unknownCode, taxonToString };

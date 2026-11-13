const alwaysIncludeVernacularNames = false;
const alwaysIncludeSingleVernacularName = true;

// lower-case search parts, computed once per taxon item (see useTaxa)
export type TaxonSearchKeys = {
  code: string;
  labelParts: string[];
  labelPartsWithCode: string[];
  vernacularNameParts: string[];
  vernacularNamesJointParts: string[];
};

const preparePartForSearch = (part: string): string => part.toLocaleLowerCase();

export const extractPartsForSearch = (value?: string | null): string[] =>
  value?.trim()?.split(" ").map(preparePartForSearch) ?? [];

export const buildTaxonLabel = ({
  codeVisible,
  taxon,
}: {
  codeVisible: boolean;
  taxon: any;
}): string => {
  const { props, scientificName } = taxon;
  const { code, scientificName: scientificNameProp } = props;
  const parts = [];
  if (codeVisible) {
    parts.push(`(${code})`);
  }
  parts.push(scientificName ?? scientificNameProp);
  return parts.join(" ");
};

export const buildTaxonSearchKeys = (taxon: any): TaxonSearchKeys => ({
  code: preparePartForSearch(String(taxon.props.code ?? "")),
  labelParts: extractPartsForSearch(
    buildTaxonLabel({ codeVisible: false, taxon }),
  ),
  labelPartsWithCode: extractPartsForSearch(
    buildTaxonLabel({ codeVisible: true, taxon }),
  ),
  vernacularNameParts: extractPartsForSearch(taxon.vernacularName),
  vernacularNamesJointParts: extractPartsForSearch(taxon.vernacularNamesJoint),
});

const somePartStartsWith = (parts: string[], prefix: string): boolean =>
  parts.some((part) => part.startsWith(prefix));

export const isTaxonMatchingFilter = ({
  codeVisible,
  inputValueParts,
  taxon,
}: {
  codeVisible: boolean;
  inputValueParts: string[];
  taxon: any;
}): boolean => {
  const { vernacularName, vernacularNamesCount } = taxon;
  const searchKeys: TaxonSearchKeys =
    taxon.searchKeys ?? buildTaxonSearchKeys(taxon);
  const singleVernacularName = vernacularNamesCount === 1;
  const itemLabelParts = codeVisible
    ? searchKeys.labelPartsWithCode
    : searchKeys.labelParts;

  const matchingCode = searchKeys.code.startsWith(inputValueParts[0]!);
  const matchingLabel = inputValueParts.every((inputValuePart) =>
    somePartStartsWith(itemLabelParts, inputValuePart),
  );
  const matchingVernacularName = inputValueParts.every(
    (inputValuePart) =>
      somePartStartsWith(searchKeys.vernacularNameParts, inputValuePart) ||
      somePartStartsWith(searchKeys.vernacularNamesJointParts, inputValuePart),
  );
  return (
    ((matchingCode || matchingLabel) &&
      (alwaysIncludeVernacularNames ||
        !vernacularName ||
        (alwaysIncludeSingleVernacularName && singleVernacularName))) ||
    matchingVernacularName
  );
};

export const filterTaxa = ({
  codeVisible,
  filterInputValue,
  maxItems,
  taxa,
  unknownTaxon,
  unlistedTaxon,
}: {
  codeVisible: boolean;
  filterInputValue: string | null | undefined;
  maxItems: number;
  taxa: any[];
  unknownTaxon: any;
  unlistedTaxon: any;
}): any[] => {
  if ((filterInputValue?.trim().length ?? 0) === 0) {
    return [];
  }
  const inputValueParts = extractPartsForSearch(filterInputValue);
  const taxaFiltered = [];
  for (
    let index = 0;
    index < taxa.length && taxaFiltered.length < maxItems;
    index++
  ) {
    const taxon = taxa[index];
    if (isTaxonMatchingFilter({ codeVisible, inputValueParts, taxon })) {
      taxaFiltered.push(taxon);
    }
  }
  if (taxaFiltered.length === 0) {
    taxaFiltered.push(unlistedTaxon, unknownTaxon);
  }
  return taxaFiltered;
};

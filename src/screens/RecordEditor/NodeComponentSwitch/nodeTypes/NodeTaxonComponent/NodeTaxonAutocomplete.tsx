import React, { useCallback, useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { SelectableListWithFilter } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { Taxa } from "model";

import { useTaxaFiltered } from "./useTaxaFiltered";

const alwaysIncludeVernacularNames = false;
const alwaysIncludeSingleVernacularName = true;
const maxDisplayedItems = 50;

const itemKeyExtractor = (item: any) => `${item?.uuid}_${item?.vernacularNameUuid}`;

const itemLabelExtractor =
  ({
    nodeDef
  }: any) =>
  (taxon: any) => {
    const { props, scientificName } = taxon;
    const { code, scientificName: scientificNameProp } = props;
    const visibleFields = NodeDefs.getVisibleFields(nodeDef);
    const codeVisible = !visibleFields || visibleFields.includes("code");
    const parts = [];
    if (codeVisible) {
      parts.push(`(${code})`);
    }
    parts.push(scientificName ?? scientificNameProp);
    return parts.join(" ");
  };

const itemDescriptionExtractor = (taxon: any) => {
  const { vernacularNamesJoint, vernacularName, vernacularNameLangCode } =
    taxon;
  if (vernacularNamesJoint) {
    return vernacularNamesJoint;
  } else if (vernacularName) {
    return `${vernacularName} (${vernacularNameLangCode})`;
  } else {
    return undefined;
  }
};

const createTaxonValue = ({
  taxon,
  inputValue
}: any) => {
  let value = null;
  if (taxon) {
    value = { taxonUuid: taxon.uuid };
    if (taxon.vernacularNameUuid) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      value["vernacularNameUuid"] = taxon.vernacularNameUuid;
    }
    if (
      inputValue &&
      [Taxa.unknownCode, Taxa.unlistedCode].includes(taxon.props.code)
    ) {
      // keep scientific name for unlisted/unknown taxa
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      value["scientificName"] = inputValue;
    }
  }
  return value;
};

const preparePartForSearch = (part: any) => part.toLocaleLowerCase();

const extractPartsForSearch = (value: any) => value?.trim()?.split(" ").map(preparePartForSearch) ?? [];

const isTaxonMatchingFilter = ({
  nodeDef,
  taxon,
  inputValueParts
}: any) => {
  const { vernacularName, vernacularNamesCount, vernacularNamesJoint } = taxon;
  const singleVernacularName = vernacularNamesCount === 1;
  const { code } = taxon.props;
  const codeForSearch = preparePartForSearch(code);
  const vernacularNameParts = extractPartsForSearch(vernacularName);
  const vernacularNamesJointParts = extractPartsForSearch(vernacularNamesJoint);

  const itemLabel = itemLabelExtractor({ nodeDef })(taxon);
  const itemLabelParts = extractPartsForSearch(itemLabel);

  const matchingCode = codeForSearch.startsWith(inputValueParts[0]);
  const matchingLabel = inputValueParts.every((inputValuePart: any) => itemLabelParts.some((part: any) => part.startsWith(inputValuePart))
  );
  const matchingVernarcularName = inputValueParts.every(
    (inputValuePart: any) => vernacularNameParts.some((part: any) => part.startsWith(inputValuePart)) ||
    vernacularNamesJointParts.some((part: any) => part.startsWith(inputValuePart))
  );
  return (
    ((matchingCode || matchingLabel) &&
      (alwaysIncludeVernacularNames ||
        !vernacularName ||
        (alwaysIncludeSingleVernacularName && singleVernacularName))) ||
    matchingVernarcularName
  );
};

const filterItems =
  ({
    nodeDef,
    unlistedTaxon,
    unknownTaxon
  }: any) =>
  ({
    items: taxa,
    filterInputValue
  }: any) => {
    if ((filterInputValue?.trim().length ?? 0) === 0) {
      return [];
    }
    const inputValueParts = extractPartsForSearch(filterInputValue);
    const taxaFiltered = [];
    for (
      let index = 0;
      index < taxa.length && taxaFiltered.length < maxDisplayedItems;
      index++
    ) {
      const taxon = taxa[index];
      if (isTaxonMatchingFilter({ nodeDef, taxon, inputValueParts })) {
        taxaFiltered.push(taxon);
      }
    }
    if (taxaFiltered.length === 0) {
      taxaFiltered.push(unlistedTaxon, unknownTaxon);
    }
    return taxaFiltered;
  };

export const NodeTaxonAutocomplete = (props: any) => {
  const { nodeDef, parentNodeUuid, selectedTaxon, updateNodeValue } = props;

  if (__DEV__) {
    console.log(
      `rendering NodeTaxonAutocomplete for ${NodeDefs.getName(nodeDef)}`
    );
  }

  const { taxa, unlistedTaxon, unknownTaxon } = useTaxaFiltered({
    nodeDef,
    parentNodeUuid,
    joinVernacularNames: !NodeDefs.isVernacularNameSelectionKept(nodeDef),
  });

  const onSelectedItemsChange = useCallback(
    (selection: any, inputValue: any) => {
      const taxon = selection[0];
      const valueNext = createTaxonValue({ taxon, inputValue });
      updateNodeValue({ value: valueNext });
    },
    [updateNodeValue]
  );

  const filterItemsCallback = useMemo(
    () => filterItems({ nodeDef, unknownTaxon, unlistedTaxon }),
    [nodeDef, unknownTaxon, unlistedTaxon]
  );

  return (
    <SelectableListWithFilter
      filterItems={filterItemsCallback}
      itemKeyExtractor={itemKeyExtractor}
      itemLabelExtractor={itemLabelExtractor({ nodeDef })}
      itemDescriptionExtractor={itemDescriptionExtractor}
      items={taxa}
      onSelectedItemsChange={onSelectedItemsChange}
      selectedItems={selectedTaxon ? [selectedTaxon] : []}
    />
  );
};

NodeTaxonAutocomplete.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
  selectedTaxon: PropTypes.object,
  updateNodeValue: PropTypes.func.isRequired,
};

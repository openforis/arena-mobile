import React, { useCallback } from "react";
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { SelectableListWithFilter } from "components";
import { Taxa } from "model";
import { useTaxaFiltered } from "./useTaxaFiltered";

const alwaysIncludeVernacularNames = false;
const alwaysIncludeSingleVernacularName = true;

const itemKeyExtractor = (item) => `${item?.uuid}_${item?.vernacularNameUuid}`;

const itemLabelExtractor =
  ({ nodeDef }) =>
  (taxon) => {
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

const itemDescriptionExtractor = (taxon) => {
  const { vernacularName, vernacularNameLangCode } = taxon;
  return vernacularName
    ? `${vernacularName} (${vernacularNameLangCode})`
    : undefined;
};

const createTaxonValue = ({ taxon, inputValue }) => {
  let value = null;
  if (taxon) {
    value = { taxonUuid: taxon.uuid };
    if (taxon.vernacularNameUuid) {
      value["vernacularNameUuid"] = taxon.vernacularNameUuid;
    }
    if (
      inputValue &&
      [Taxa.unknownCode, Taxa.unlistedCode].includes(taxon.props.code)
    ) {
      // keep scientific name for unlisted/unknown taxa
      value["scientificName"] = inputValue;
    }
  }
  return value;
};

const preparePartForSearch = (part) => part.toLocaleLowerCase();

const extractPartsForSearch = (value) =>
  value?.trim()?.split(" ").map(preparePartForSearch) ?? [];

const filterItems =
  ({ nodeDef, unlistedTaxon, unknownTaxon }) =>
  ({ items: taxa, filterInputValue }) => {
    if ((filterInputValue?.trim().length ?? 0) === 0) {
      return [];
    }
    const inputValueParts = extractPartsForSearch(filterInputValue);
    const taxaFiltered = [];
    const limit = 30;
    for (
      let index = 0;
      index < taxa.length && taxaFiltered.length < limit;
      index++
    ) {
      const taxon = taxa[index];

      const { vernacularName, vernacularNamesCount } = taxon;
      const singleVernacularName = vernacularNamesCount === 1;
      if (
        alwaysIncludeSingleVernacularName &&
        singleVernacularName &&
        !vernacularName
      ) {
        // skip taxon without vernacular name specified
        continue;
      }
      const { code } = taxon.props;
      const codeForSearch = preparePartForSearch(code);
      const vernacularNameParts = extractPartsForSearch(vernacularName);

      const itemLabel = itemLabelExtractor({ nodeDef })(taxon);
      const itemLabelParts = extractPartsForSearch(itemLabel);

      const matchingCode = codeForSearch.startsWith(inputValueParts[0]);
      const matchingLabel = inputValueParts.every((inputValuePart) =>
        itemLabelParts.some((part) => part.startsWith(inputValuePart))
      );
      const matchingVernarcularName = inputValueParts.every((inputValuePart) =>
        vernacularNameParts.some((part) => part.startsWith(inputValuePart))
      );
      if (
        ((matchingCode || matchingLabel) &&
          (alwaysIncludeVernacularNames ||
            !vernacularName ||
            (alwaysIncludeSingleVernacularName && singleVernacularName))) ||
        matchingVernarcularName
      ) {
        taxaFiltered.push(taxon);
      }
    }
    if (taxaFiltered.length === 0) {
      taxaFiltered.push(unlistedTaxon, unknownTaxon);
    }
    return taxaFiltered;
  };

export const NodeTaxonAutocomplete = (props) => {
  const { nodeDef, parentNodeUuid, selectedTaxon, updateNodeValue } = props;

  if (__DEV__) {
    console.log(
      `rendering NodeTaxonAutocomplete for ${NodeDefs.getName(nodeDef)}`
    );
  }
  const { taxa, unlistedTaxon, unknownTaxon } = useTaxaFiltered({
    nodeDef,
    parentNodeUuid,
  });

  const onSelectedItemsChange = useCallback(
    (selection, inputValue) => {
      const taxon = selection[0];
      const valueNext = createTaxonValue({ taxon, inputValue });
      updateNodeValue({ value: valueNext });
    },
    [updateNodeValue]
  );

  return (
    <SelectableListWithFilter
      filterItems={filterItems({ nodeDef, unlistedTaxon, unknownTaxon })}
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

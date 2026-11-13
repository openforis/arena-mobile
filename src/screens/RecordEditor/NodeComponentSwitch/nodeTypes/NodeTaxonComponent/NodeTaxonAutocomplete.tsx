import { useCallback, useMemo } from "react";

import { NodeDefs, NodeDefTaxon } from "@openforis/arena-core";

import { SelectableListWithFilter } from "components";
import { Taxa } from "model";
import { log } from "utils";

import { buildTaxonLabel, filterTaxa } from "./taxaSearch";
import { useTaxaFiltered } from "./useTaxaFiltered";

const maxDisplayedItems = 50;
const noTaxa: any[] = [];

const itemKeyExtractor = (item: any) =>
  `${item?.uuid}_${item?.vernacularNameUuid}`;

const itemLabelExtractorWithCode = (taxon: any) =>
  buildTaxonLabel({ codeVisible: true, taxon });

const itemLabelExtractorWithoutCode = (taxon: any) =>
  buildTaxonLabel({ codeVisible: false, taxon });

const isCodeVisible = (nodeDef: any): boolean => {
  const visibleFields = NodeDefs.getVisibleFields(nodeDef);
  return !visibleFields || visibleFields.includes("code");
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
  nodeDef,
  taxon,
  inputValue,
}: {
  nodeDef: NodeDefTaxon;
  taxon: any;
  inputValue: string;
}) => {
  let value: any = null;
  if (taxon) {
    value = { taxonUuid: taxon.uuid };
    if (
      taxon.vernacularNameUuid ||
      (NodeDefs.isVernacularNameAlwaysIncludedIfSingle(nodeDef) &&
        taxon.singleVernacularNameUuid)
    ) {
      value["vernacularNameUuid"] =
        taxon.vernacularNameUuid ?? taxon.singleVernacularNameUuid;
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

type NodeTaxonAutocompleteProps = {
  nodeDef: any;
  parentNodeUuid?: string;
  selectedTaxon?: any;
  updateNodeValue: (params: { value: any }) => void;
};

export const NodeTaxonAutocomplete = (props: NodeTaxonAutocompleteProps) => {
  const { nodeDef, parentNodeUuid, selectedTaxon, updateNodeValue } = props;

  log.debug(`rendering NodeTaxonAutocomplete for ${NodeDefs.getName(nodeDef)}`);

  const { taxa, unlistedTaxon, unknownTaxon } = useTaxaFiltered({
    nodeDef,
    parentNodeUuid,
  });

  const onSelectedItemsChange = useCallback(
    (selection: any, inputValue: any) => {
      const taxon = selection[0];
      const valueNext = createTaxonValue({ nodeDef, taxon, inputValue });
      updateNodeValue({ value: valueNext });
    },
    [nodeDef, updateNodeValue],
  );

  const codeVisible = isCodeVisible(nodeDef);

  const filterItems = useCallback(
    ({ items, filterInputValue }: any) =>
      filterTaxa({
        codeVisible,
        filterInputValue,
        maxItems: maxDisplayedItems,
        taxa: items,
        unknownTaxon,
        unlistedTaxon,
      }),
    [codeVisible, unknownTaxon, unlistedTaxon],
  );

  const selectedItems = useMemo(
    () => (selectedTaxon ? [selectedTaxon] : noTaxa),
    [selectedTaxon],
  );

  return (
    <SelectableListWithFilter
      filterItems={filterItems}
      itemKeyExtractor={itemKeyExtractor}
      itemLabelExtractor={
        codeVisible ? itemLabelExtractorWithCode : itemLabelExtractorWithoutCode
      }
      itemDescriptionExtractor={itemDescriptionExtractor}
      items={taxa}
      onSelectedItemsChange={onSelectedItemsChange}
      selectedItems={selectedItems}
    />
  );
};

import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { Button, CloseIconButton, HView, Text, VView, View } from "components";
import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeTaxonEditDialog } from "./NodeTaxonEditDialog";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";
import { TaxonValuePreview } from "../../../NodeValuePreview/TaxonValuePreview";
import { useTaxonByNodeValue } from "../../../NodeValuePreview/useTaxonByNodeValue";

import styles from "./styles";

export const NodeTaxonComponent = (props) => {
  const { nodeDef, nodeUuid, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(
      `rendering NodeTaxonComponent for ${NodeDefs.getName(nodeDef)}`
    );
  }
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const openEditDialog = () => setEditDialogOpen(true);
  const closeEditDialog = () => setEditDialogOpen(false);

  const { value, updateNodeValue, onClearPress } = useNodeComponentLocalState({
    nodeUuid,
  });

  const selectedTaxon = useTaxonByNodeValue({ value });
  const selectedTaxonVernacularName = selectedTaxon?.vernacularName;

  const selectedTaxonContainerStyle = useMemo(
    () => [
      styles.selectedTaxonContainer,
      { height: selectedTaxonVernacularName ? 70 : 40 },
    ],
    [selectedTaxonVernacularName]
  );

  return (
    <VView>
      <View style={styles.selectedTaxonWrapper}>
        {selectedTaxon ? (
          <HView style={selectedTaxonContainerStyle}>
            <TaxonValuePreview
              nodeDef={nodeDef}
              style={styles.selectedTaxonText}
              value={value}
            />
            <CloseIconButton mode="text" onPress={onClearPress} />
          </HView>
        ) : (
          <Text textKey="dataEntry:taxon.taxonNotSelected" />
        )}
      </View>
      {viewMode === RecordEditViewMode.oneNode && (
        <NodeTaxonAutocomplete
          nodeDef={nodeDef}
          parentNodeUuid={parentNodeUuid}
          updateNodeValue={updateNodeValue}
        />
      )}
      {viewMode === RecordEditViewMode.form && (
        <>
          <Button
            icon="magnify"
            onPress={openEditDialog}
            style={styles.searchButton}
            textKey="dataEntry:taxon.search"
          />
          {editDialogOpen && (
            <NodeTaxonEditDialog
              onDismiss={closeEditDialog}
              nodeDef={nodeDef}
              parentNodeUuid={parentNodeUuid}
              selectedTaxon={selectedTaxon}
              updateNodeValue={updateNodeValue}
            />
          )}
        </>
      )}
    </VView>
  );
};

NodeTaxonComponent.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
  parentNodeUuid: PropTypes.string,
};

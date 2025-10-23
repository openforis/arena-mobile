import { useState } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, CloseIconButton, HView, Text, VView, View } from "components";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordEditViewMode } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveyOptionsSelectors } from "state";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeTaxonEditDialog } from "./NodeTaxonEditDialog";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";
import { TaxonValuePreview } from "../../../NodeValuePreview/TaxonValuePreview";
import { useTaxonByNodeValue } from "../../../NodeValuePreview/useTaxonByNodeValue";
import { useDynamicStyles } from "./useDynamicStyles";
import styles from "./styles";

export const NodeTaxonComponent = (props: any) => {
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
  // @ts-expect-error TS(2551): Property 'vernacularName' does not exist on type '... Remove this comment to see the full error message
  const selectedTaxonVernacularName = selectedTaxon?.vernacularName;
  const { containerStyle, selectedTaxonContainerStyle } = useDynamicStyles({
    selectedTaxonVernacularName,
  });

  return (
    <VView style={containerStyle}>
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

import { useState } from "react";

import { NodeDefs } from "@openforis/arena-core";

import { Button, CloseIconButton, HView, Text, VView, View } from "components";
import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";
import { log } from "utils";

import { useNodeComponentLocalState } from "../../../useNodeComponentLocalState";
import { NodeTaxonEditDialog } from "./NodeTaxonEditDialog";
import { NodeTaxonAutocomplete } from "./NodeTaxonAutocomplete";
import { TaxonValuePreview } from "../../../NodeValuePreview/TaxonValuePreview";
import { useTaxonByNodeValue } from "../../../NodeValuePreview/useTaxonByNodeValue";
import { useDynamicStyles } from "./useDynamicStyles";
import styles from "./styles";

type NodeTaxonComponentProps = {
  nodeDef: any;
  nodeUuid?: string;
  parentNodeUuid?: string;
};

export const NodeTaxonComponent = (props: NodeTaxonComponentProps) => {
  const { nodeDef, nodeUuid, parentNodeUuid } = props;

  log.debug(`rendering NodeTaxonComponent for ${NodeDefs.getName(nodeDef)}`);
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const openEditDialog = () => setEditDialogOpen(true);
  const closeEditDialog = () => setEditDialogOpen(false);

  const { value, updateNodeValue, onClearPress } = useNodeComponentLocalState({
    nodeUuid,
  });

  const selectedTaxon = useTaxonByNodeValue({ value });
  const selectedTaxonVernacularName = selectedTaxon?.vernacularName;
  const { containerStyle, selectedTaxonContainerStyle } = useDynamicStyles({
    selectedTaxonVernacularName,
  });

  return (
    <VView style={containerStyle}>
      <View style={styles.selectedTaxonWrapper}>
        {selectedTaxon ? (
          <HView style={selectedTaxonContainerStyle}>
            <TaxonValuePreview nodeDef={nodeDef} value={value} />
            <CloseIconButton onPress={onClearPress} />
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

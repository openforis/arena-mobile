import { useCallback } from "react";
import { StyleSheet } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { Button, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { log } from "utils";

import { NodeComponentProps } from "./nodeComponentPropTypes";

const styles = StyleSheet.create({
  editButton: { alignSelf: "center" },
});

export const NodeMultipleEntityPreviewComponent = (
  props: NodeComponentProps,
) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug(
    `rendering NodeMultipleEntityPreviewComponent for ${NodeDefs.getName(nodeDef)}`,
  );

  const entityDefUuid = nodeDef.uuid;

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const editable = DataEntrySelectors.useRecordNodePointerEditable({
    parentNodeUuid,
    nodeDefUuid: entityDefUuid,
  });

  const onEditPress = useCallback(
    () =>
      dispatch(
        DataEntryActions.selectCurrentPageEntity({
          parentEntityUuid: parentNodeUuid,
          entityDefUuid,
        }),
      ),
    [dispatch, entityDefUuid, parentNodeUuid],
  );

  return (
    <VView>
      <Button
        onPress={onEditPress}
        style={styles.editButton}
        textKey={editable ? "dataEntry:editNodeDef" : "dataEntry:viewNodeDef"}
        textParams={{ nodeDef: NodeDefs.getLabelOrName(nodeDef, lang) }}
      />
    </VView>
  );
};

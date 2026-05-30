import { useCallback, useMemo } from "react";

import { NodeDefs, Nodes, Records } from "@openforis/arena-core";

import { Button, VView } from "components";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";
import { log } from "utils";

import { NodeComponentProps } from "./nodeComponentPropTypes";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  editButton: { alignSelf: "center" },
});

export const NodeMultipleEntityPreviewComponent = (
  props: NodeComponentProps,
) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug("rendering NodeMultipleEntityPreviewComponent");

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const record = DataEntrySelectors.useRecord();
  const entityDefUuid = nodeDef.uuid;

  const editable = useMemo(() => {
    if (!parentNodeUuid) {
      return true;
    }
    const parentEntity = Records.getNodeByUuid(parentNodeUuid)(record);
    if (!parentEntity) {
      return true;
    }
    return (
      Records.isNodeEditable({ record, node: parentEntity }) &&
      Nodes.isChildEditable(parentEntity, entityDefUuid)
    );
  }, [entityDefUuid, parentNodeUuid, record]);

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

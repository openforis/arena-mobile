import { useCallback } from "react";

import { NodeDefs } from "@openforis/arena-core";

import { Button, VView } from "components";
import { DataEntryActions, SurveySelectors, useAppDispatch } from "state";
import { log } from "utils";

import { NodeComponentProps } from "./nodeComponentPropTypes";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  editButton: { alignSelf: "center" },
});

export const NodeMultipleEntityPreviewComponent = (
  props: NodeComponentProps
) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug("rendering NodeMultipleEntityPreviewComponent");

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const entityDefUuid = nodeDef.uuid;

  const onEditPress = useCallback(
    () =>
      dispatch(
        DataEntryActions.selectCurrentPageEntity({
          parentEntityUuid: parentNodeUuid,
          entityDefUuid,
        })
      ),
    [dispatch, entityDefUuid, parentNodeUuid]
  );

  return (
    <VView>
      <Button
        onPress={onEditPress}
        style={styles.editButton}
        textKey="dataEntry:editNodeDef"
        textParams={{ nodeDef: NodeDefs.getLabelOrName(nodeDef, lang) }}
      />
    </VView>
  );
};

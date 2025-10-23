import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs } from "@openforis/arena-core";

import { Button, VView } from "components";
import { DataEntryActions, SurveySelectors } from "state";

import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

const styles = {
  editButton: { alignSelf: "center" },
};

export const NodeMultipleEntityPreviewComponent = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log("rendering NodeMultipleEntityPreviewComponent");
  }

  const dispatch = useDispatch();
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

NodeMultipleEntityPreviewComponent.propTypes = NodeComponentPropTypes;

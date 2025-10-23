import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { NodeDefs } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button, VView } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntryActions, SurveySelectors } from "state";

import { NodeComponentPropTypes } from "./nodeComponentPropTypes";

const styles = {
  editButton: { alignSelf: "center" },
};

export const NodeMultipleEntityPreviewComponent = (props: any) => {
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

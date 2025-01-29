import { useMemo, useState } from "react";

import { NodeDefs, Records, Surveys } from "@openforis/arena-core";

import { RecordNodes } from "model";
import { ValidationUtils } from "model/utils/ValidationUtils";
import { useTranslation } from "localization";

import { DataEntrySelectors } from "state/dataEntry";
import { ScreenOptionsSelectors } from "state/screenOptions";
import { SurveySelectors } from "state/survey";

import { DataVisualizer, Text, VView } from "components";

import { NodeEditDialog } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeEditDialog";

import styles from "./styles";

const getNodePath = ({ survey, record, nodeUuid, lang }) => {
  const node = Records.getNodeByUuid(nodeUuid)(record);
  const parts = [];
  Records.visitAncestorsAndSelf(node, (visitedAncestor) => {
    const nodeDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: visitedAncestor.nodeDefUuid,
    });
    if (NodeDefs.isRoot(nodeDef)) {
      return;
    }
    const labelOrName = NodeDefs.getLabelOrName(nodeDef, lang);
    let part = labelOrName;
    if (NodeDefs.isMultiple(nodeDef)) {
      const keys = RecordNodes.getEntityKeysFormatted({
        survey,
        record,
        entity: visitedAncestor,
        lang,
        emptyValue: "-",
      });
      part = part + `[${keys.join(",")}]`;
    }
    parts.unshift(part);
  })(record);
  return parts.join(" / ");
};

export const RecordValidationReport = () => {
  const { t } = useTranslation();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const [state, setState] = useState({
    editDialogOpen: false,
    dialogNodeDef: null,
    dialogNodeUuid: null,
    dialogParentNodeUuid: null,
  });

  const {
    editDialogOpen,
    dialogNodeDef,
    dialogNodeUuid,
    dialogParentNodeUuid,
  } = state;

  const { validation } = record;
  const { fields: validationFields } = validation;

  const items = useMemo(
    () =>
      Object.entries(validationFields).reduce(
        (acc, [nodeUuid, validationResult]) => {
          const node = Records.getNodeByUuid(nodeUuid)(record);
          if (!node) return acc;

          const nodeDef = Surveys.getNodeDefByUuid({
            survey,
            uuid: node.nodeDefUuid,
          });
          const parentNodeUuid = node.parentUuid;
          const path = getNodePath({ survey, record, nodeUuid, lang });
          const error = ValidationUtils.getJointErrorText({
            validation: validationResult,
            t,
            customMessageLang: lang,
          });
          acc.push({ key: nodeUuid, nodeDef, parentNodeUuid, path, error });
          return acc;
        },
        []
      ),
    [lang, record, survey, t, validationFields]
  );

  const onRowPress = (item) => {
    const {
      key: dialogNodeUuid,
      nodeDef: dialogNodeDef,
      parentNodeUuid: dialogParentNodeUuid,
    } = item;
    setState({
      editDialogOpen: true,
      dialogNodeDef,
      dialogNodeUuid,
      dialogParentNodeUuid,
    });
  };

  return (
    <VView style={styles.container}>
      {items.length === 0 && (
        <Text
          textKey="dataEntry:validationReport.noErrorsFound"
          variant="titleLarge"
        />
      )}
      {items.length > 0 && (
        <DataVisualizer
          fields={[
            {
              key: "path",
              header: "common:path",
            },
            {
              key: "error",
              header: "common:error",
            },
          ]}
          items={items}
          mode={screenViewMode}
          onItemPress={onRowPress}
        />
      )}
      {editDialogOpen && (
        <NodeEditDialog
          nodeDef={dialogNodeDef}
          nodeUuid={dialogNodeUuid}
          parentNodeUuid={dialogParentNodeUuid}
          onDismiss={() => setState({ editDialogOpen: false })}
        />
      )}
    </VView>
  );
};

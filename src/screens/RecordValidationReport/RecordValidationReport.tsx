import { useMemo, useState } from "react";

import {
  NodeDefs,
  Objects,
  Records,
  RecordValidations,
  Surveys,
} from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordNodes } from "model";
// @ts-expect-error TS(2307): Cannot find module 'model/utils/ValidationUtils' o... Remove this comment to see the full error message
import { ValidationUtils } from "model/utils/ValidationUtils";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";

// @ts-expect-error TS(2307): Cannot find module 'state/dataEntry' or its corres... Remove this comment to see the full error message
import { DataEntrySelectors } from "state/dataEntry";
// @ts-expect-error TS(2307): Cannot find module 'state/screenOptions' or its co... Remove this comment to see the full error message
import { ScreenOptionsSelectors } from "state/screenOptions";
// @ts-expect-error TS(2307): Cannot find module 'state/survey' or its correspon... Remove this comment to see the full error message
import { SurveySelectors } from "state/survey";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { DataVisualizer, Text, VView } from "components";

// @ts-expect-error TS(2307): Cannot find module 'screens/RecordEditor/NodeCompo... Remove this comment to see the full error message
import { NodeEditDialog } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeEditDialog";

import styles from "./styles";

const nodePathPartSeparator = " / ";

const getNodePath = ({
  survey,
  record,
  nodeUuid,
  lang
}: any) => {
  const node = Records.getNodeByUuid(nodeUuid)(record);
  const parts: any = [];
  // @ts-expect-error TS(2345): Argument of type 'Node | undefined' is not assigna... Remove this comment to see the full error message
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
  return parts.join(nodePathPartSeparator);
};

const extractValidationItem = ({
  survey,
  record,
  validationFieldKey,
  validationResult,
  lang,
  t
}: any) => {
  let invalidNodeDefUuid, invalidParentNodeUuid, invalidNodeUuid;
  if (RecordValidations.isValidationChildrenCountKey(validationFieldKey)) {
    invalidNodeDefUuid =
      RecordValidations.extractValidationChildrenCountKeyNodeDefUuid(
        validationFieldKey
      );
    invalidParentNodeUuid =
      RecordValidations.extractValidationChildrenCountKeyParentUuid(
        validationFieldKey
      );
  } else {
    const node = Records.getNodeByUuid(validationFieldKey)(record);
    if (!node) return null;

    invalidNodeUuid = validationFieldKey;
    invalidNodeDefUuid = node.nodeDefUuid;
    invalidParentNodeUuid = node.parentUuid;
  }
  const invalidNodeDef = Surveys.getNodeDefByUuid({
    survey,
    uuid: invalidNodeDefUuid,
  });

  const path = invalidNodeUuid
    ? getNodePath({
        survey,
        record,
        nodeUuid: invalidNodeUuid,
        lang,
      })
    : [
        getNodePath({
          survey,
          record,
          nodeUuid: invalidParentNodeUuid,
          lang,
        }),
        NodeDefs.getLabelOrName(invalidNodeDef, lang),
      ]
        .filter(Objects.isNotEmpty)
        .join(nodePathPartSeparator);

  const error = ValidationUtils.getJointErrorText({
    validation: validationResult,
    t,
    customMessageLang: lang,
  });
  return {
    key: validationFieldKey,
    nodeDef: invalidNodeDef,
    parentNodeUuid: invalidParentNodeUuid,
    path,
    error,
  };
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
        (acc, [validationFieldKey, validationResult]) => {
          const validationItem = extractValidationItem({
            survey,
            record,
            validationFieldKey,
            validationResult,
            lang,
            t,
          });
          if (validationItem) {
            // @ts-expect-error TS(2345): Argument of type '{ key: any; nodeDef: NodeDef<Nod... Remove this comment to see the full error message
            acc.push(validationItem);
          }
          return acc;
        },
        []
      ),
    [lang, record, survey, t, validationFields]
  );

  const onRowPress = (item: any) => {
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
          // @ts-expect-error TS(2345): Argument of type '{ editDialogOpen: false; }' is n... Remove this comment to see the full error message
          onDismiss={() => setState({ editDialogOpen: false })}
        />
      )}
    </VView>
  );
};

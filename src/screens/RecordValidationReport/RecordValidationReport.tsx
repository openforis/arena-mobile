import { useMemo, useState } from "react";

import {
  NodeDef,
  NodeDefs,
  Objects,
  Records,
  RecordValidations,
  Surveys,
  Validations,
} from "@openforis/arena-core";

import { RecordNodes } from "model";
import { ValidationUtils } from "model/utils/ValidationUtils";
import { useTranslation } from "localization";

import { DataEntrySelectors } from "state/dataEntry";
import { ScreenOptionsSelectors } from "state/screenOptions";
import { SurveySelectors } from "state/survey";

import { DataVisualizer, Text, VView } from "components";

import { NodeEditDialog } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeEditDialog";

import styles from "./styles";

const nodePathPartSeparator = " / ";

const getNodePath = ({ survey, record, nodeUuid, lang }: any) => {
  const parts: any = [];
  const node = Records.getNodeByUuid(nodeUuid)(record);
  if (!node) {
    return parts;
  }
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
  t,
}: any): {
  key: string;
  nodeDef: NodeDef<any>;
  parentNodeUuid?: string;
  path: string;
  error: string;
} | null => {
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

type RecordValidationReportState = {
  editDialogOpen: boolean;
  dialogNodeDef?: object;
  dialogNodeUuid?: string;
  dialogParentNodeUuid?: string;
};

const initialState: RecordValidationReportState = {
  editDialogOpen: false,
};

export const RecordValidationReport = () => {
  const { t } = useTranslation();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const [state, setState] = useState(initialState);

  const {
    editDialogOpen,
    dialogNodeDef,
    dialogNodeUuid,
    dialogParentNodeUuid,
  } = state;

  const { validation } = record;
  const validationFields = Validations.getFieldValidations(validation);

  const items: any[] = useMemo(
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
            acc.push(validationItem);
          }
          return acc;
        },
        [] as any[]
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
          parentNodeUuid={dialogParentNodeUuid}
          onDismiss={() => setState({ editDialogOpen: false })}
        />
      )}
    </VView>
  );
};

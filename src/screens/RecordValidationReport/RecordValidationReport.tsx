import { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";

import {
  ArenaAnyNodeDef,
  ArenaRecord,
  ArenaSurvey,
  ArenaValidation,
  LanguageCode,
  NodeDefs,
  Objects,
  Records,
  RecordValidations,
  Surveys,
  ArenaValidationFields,
  Validations,
} from "@openforis/arena-core";

import { RecordUtils } from "model";
import { ValidationUtils } from "model/utils/ValidationUtils";
import { useTranslation } from "localization";

import { useAppDispatch } from "state";
import { DataEntryActions, DataEntrySelectors } from "state/dataEntry";
import { ScreenOptionsSelectors } from "state/screenOptions";
import { SurveySelectors } from "state/survey";

import { DataVisualizer, DataVisualizerField, Text, VView } from "components";

import { NodeEditDialog } from "screens/RecordEditor/NodeComponentSwitch/nodeTypes/NodeEditDialog";

import styles from "./styles";

const nodePathPartSeparator = " / ";

const fields: DataVisualizerField[] = [
  {
    key: "path",
    header: "common:path",
  },
  {
    key: "error",
    header: "common:error",
  },
];

type ValidationItem = {
  key: string;
  nodeDef: ArenaAnyNodeDef;
  parentNodeUuid?: string;
  path: string;
  error: string | null;
};

// empty array (filtered out as empty path part) when the node is not found
const getNodePath = ({
  survey,
  record,
  nodeUuid,
  lang,
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  nodeUuid: string | undefined;
  lang: LanguageCode;
}): string | string[] => {
  const parts: string[] = [];
  const node = Records.getNodeByUuid(nodeUuid!)(record);
  if (!node) {
    return parts;
  }
  for (const visitedAncestor of Records.getAncestorsAndSelf(node)(record)) {
    const nodeDef = Surveys.getNodeDefByUuid({
      survey,
      uuid: visitedAncestor.nodeDefUuid,
    });
    if (NodeDefs.isRoot(nodeDef)) {
      continue;
    }
    const labelOrName = NodeDefs.getLabelOrName(nodeDef, lang);
    let part = labelOrName;
    if (NodeDefs.isMultiple(nodeDef)) {
      const keys = RecordUtils.getEntityKeysFormatted({
        survey,
        record,
        entity: visitedAncestor,
        lang,
        emptyValue: "-",
      });
      part = part + `[${keys.join(",")}]`;
    }
    parts.unshift(part);
  }
  return parts.join(nodePathPartSeparator);
};

const extractValidationItem = ({
  survey,
  record,
  validationFieldKey,
  validationResult,
  lang,
  t,
}: {
  survey: ArenaSurvey;
  record: ArenaRecord;
  validationFieldKey: string;
  validationResult: ArenaValidation;
  lang: LanguageCode;
  t: ReturnType<typeof useTranslation>["t"];
}): ValidationItem | null => {
  let invalidNodeDefUuid, invalidParentNodeUuid, invalidNodeUuid;
  if (RecordValidations.isValidationChildrenCountKey(validationFieldKey)) {
    invalidNodeDefUuid =
      RecordValidations.extractValidationChildrenCountKeyNodeDefUuid(
        validationFieldKey,
      );
    invalidParentNodeUuid =
      RecordValidations.extractValidationChildrenCountKeyParentUuid(
        validationFieldKey,
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
    ? (getNodePath({
        survey,
        record,
        nodeUuid: invalidNodeUuid,
        lang,
      }) as string)
    : [
        getNodePath({
          survey,
          record,
          nodeUuid: invalidParentNodeUuid,
          lang,
        }),
        NodeDefs.getLabelOrName(invalidNodeDef, lang),
      ]
        .filter((pathPart) => Objects.isNotEmpty(pathPart))
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
  dialogNodeDef?: ArenaAnyNodeDef;
  dialogNodeUuid?: string;
  dialogParentNodeUuid?: string;
};

const initialState: RecordValidationReportState = {
  editDialogOpen: false,
};

export const RecordValidationReport = () => {
  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const [state, setState] = useState(initialState);

  const { editDialogOpen, dialogNodeDef, dialogParentNodeUuid } = state;

  const { validation } = record;
  const validationFields: ArenaValidationFields = useMemo(
    () => Validations.getFieldValidations(validation),
    [validation],
  );

  const items: ValidationItem[] = useMemo(
    () =>
      Object.entries(validationFields).reduce(
        (acc, [validationFieldKey, validationResult]) => {
          const validationItem = extractValidationItem({
            survey: survey!,
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
        [] as ValidationItem[],
      ),
    [lang, record, survey, t, validationFields],
  );

  const onRowPress = useCallback(
    (item: ValidationItem) => {
      const {
        key: dialogNodeUuid,
        nodeDef: dialogNodeDef,
        parentNodeUuid: dialogParentNodeUuid,
      } = item;
      if (
        NodeDefs.isEntity(dialogNodeDef) &&
        NodeDefs.isMultiple(dialogNodeDef)
      ) {
        // entities list can be edited only in the record editor (behind this screen)
        dispatch(
          DataEntryActions.selectCurrentPageEntity({
            parentEntityUuid: dialogParentNodeUuid,
            entityDefUuid: dialogNodeDef.uuid,
          }),
        );
        navigator.goBack();
        return;
      }
      setState({
        editDialogOpen: true,
        dialogNodeDef,
        dialogNodeUuid,
        dialogParentNodeUuid,
      });
    },
    [dispatch, navigator],
  );

  const onEditDialogDismiss = useCallback(
    () => setState({ editDialogOpen: false }),
    [],
  );

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
          fields={fields}
          items={items}
          mode={screenViewMode}
          onItemPress={onRowPress}
        />
      )}
      {editDialogOpen && dialogNodeDef && (
        <NodeEditDialog
          nodeDef={dialogNodeDef}
          parentNodeUuid={dialogParentNodeUuid}
          onDismiss={onEditDialogDismiss}
        />
      )}
    </VView>
  );
};

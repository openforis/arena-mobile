import { useCallback } from "react";
import { useSelector } from "react-redux";

import { NodeDefs, Objects, Records, Surveys } from "@openforis/arena-core";

import { useTranslation } from "localization";
import { RecordUtils } from "model";
import { DataEntrySelectors, SettingsSelectors, SurveySelectors } from "state";

export type BreadcrumbItemData = {
  parentEntityUuid?: string;
  entityDefUuid: string;
  entityUuid: string | null;
  name: string;
  completionPercent?: number;
  hasErrors?: boolean;
  hasWarnings?: boolean;
};

export const useBreadcrumbItems = () => {
  const { t } = useTranslation();
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const currentPageEntity = DataEntrySelectors.useCurrentPageEntity();
  const { showRecordCompletion } = SettingsSelectors.useSettings();
  const { entityUuid, parentEntityUuid, entityDef } = currentPageEntity;
  const actualEntityUuid = entityUuid ?? parentEntityUuid;
  const entityDefUuid = entityDef.uuid;

  const itemLabelFunction = useCallback(
    ({ nodeDef, record = null, entity = null, parentEntity = null }: any) => {
      const nodeDefLabel = NodeDefs.getLabelOrName(nodeDef, lang);

      if (
        NodeDefs.isRoot(nodeDef) ||
        (NodeDefs.isMultiple(nodeDef) && parentEntity)
      ) {
        const keyValuesByName =
          RecordUtils.getEntitySummaryValuesByNameFormatted({
            survey,
            record,
            entity,
            lang,
            emptyValue: null,
            t,
          });
        const keyValuesText =
          Object.values(keyValuesByName)
            .filter(Objects.isNotEmpty)
            .join(", ") || "---";
        return nodeDefLabel + `[${keyValuesText}]`;
      }
      return nodeDefLabel;
    },
    [lang, survey, t],
  );

  return useSelector((state) => {
    if (!actualEntityUuid) return [];

    const record = DataEntrySelectors.selectRecord(state);
    const survey = SurveySelectors.selectCurrentSurvey(state)!;

    const _items: BreadcrumbItemData[] = [];

    if (parentEntityUuid && !entityUuid) {
      _items.push({
        parentEntityUuid,
        entityDefUuid,
        entityUuid: null,
        name: itemLabelFunction({ nodeDef: entityDef }),
        completionPercent: showRecordCompletion ? 0 : undefined,
      });
    }

    let currentEntity = Records.getNodeByUuid(actualEntityUuid)(record);

    while (currentEntity) {
      const parentEntity = Records.getParent(currentEntity)(record);

      const currentEntityDef = Surveys.getNodeDefByUuid({
        survey,
        uuid: currentEntity.nodeDefUuid,
      });
      const itemName = itemLabelFunction({
        nodeDef: currentEntityDef,
        record,
        parentEntity,
        entity: currentEntity,
      });
      let completionPercent: number | undefined;
      if (showRecordCompletion) {
        const completionStats = Records.getEntityCompletionStats({
          survey,
          record,
          entity: currentEntity,
          includeNestedEntities: false,
        });
        completionPercent = RecordUtils.toCompletionPercent(completionStats);
      }

      _items.unshift({
        parentEntityUuid: parentEntity?.uuid,
        entityDefUuid: currentEntityDef.uuid,
        entityUuid: currentEntity.uuid,
        name: itemName,
        completionPercent,
      });

      currentEntity = parentEntity;
    }

    const entityNodeUuids = new Set(
      _items
        .map((item) => item.entityUuid)
        .filter((entityUuid): entityUuid is string => !!entityUuid),
    );
    const { nodeUuidsWithErrors, nodeUuidsWithWarnings } =
      RecordUtils.findEntityNodesWithValidationIssues({
        record,
        entityNodeUuids,
      });
    for (const item of _items) {
      if (!item.entityUuid) continue;
      if (nodeUuidsWithErrors.has(item.entityUuid)) {
        item.hasErrors = true;
      } else if (nodeUuidsWithWarnings.has(item.entityUuid)) {
        item.hasWarnings = true;
      }
    }

    return _items;
  }, Objects.isEqual);
};

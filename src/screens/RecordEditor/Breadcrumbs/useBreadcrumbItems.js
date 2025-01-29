import { useCallback } from "react";
import { useSelector } from "react-redux";

import { NodeDefs, Objects, Records, Surveys } from "@openforis/arena-core";

import { RecordNodes } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";

export const useBreadcrumbItems = () => {
  const survey = SurveySelectors.useCurrentSurvey();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const currentPageEntity = DataEntrySelectors.useCurrentPageEntity();
  const { entityUuid, parentEntityUuid, entityDef } = currentPageEntity;
  const actualEntityUuid = entityUuid ?? parentEntityUuid;
  const entityDefUuid = entityDef.uuid;

  const itemLabelFunction = useCallback(
    ({ nodeDef, record = null, entity = null, parentEntity = null }) => {
      const nodeDefLabel = NodeDefs.getLabelOrName(nodeDef, lang);

      if (
        NodeDefs.isRoot(nodeDef) ||
        (NodeDefs.isMultiple(nodeDef) && parentEntity)
      ) {
        const keyValuesByName =
          RecordNodes.getEntitySummaryValuesByNameFormatted({
            survey,
            record,
            entity,
            lang,
            emptyValue: null,
          });
        const keyValuesText =
          Object.values(keyValuesByName)
            .filter(Objects.isNotEmpty)
            .join(", ") || "---";
        return nodeDefLabel + `[${keyValuesText}]`;
      }
      return nodeDefLabel;
    },
    [lang, survey]
  );

  return useSelector((state) => {
    if (!actualEntityUuid) return [];

    const record = DataEntrySelectors.selectRecord(state);
    const survey = SurveySelectors.selectCurrentSurvey(state);

    const _items = [];

    if (parentEntityUuid && !entityUuid) {
      _items.push({
        parentEntityUuid,
        entityDefUuid,
        entityUuid: null,
        name: itemLabelFunction({ nodeDef: entityDef }),
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

      _items.unshift({
        parentEntityUuid: parentEntity?.uuid,
        entityDefUuid: currentEntityDef.uuid,
        entityUuid: currentEntity.uuid,
        name: itemName,
      });

      currentEntity = parentEntity;
    }
    return _items;
  }, Objects.isEqual);
};

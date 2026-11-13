import { createSelector } from "@reduxjs/toolkit";
import {
  NodeDefs,
  Nodes,
  Objects,
  Records,
  Surveys,
} from "@openforis/arena-core";

import { RecordEditViewMode, RecordPageNavigator } from "model";
import {
  DataEntrySelectors,
  SurveyOptionsSelectors,
  SurveySelectors,
} from "state";
import { PreviewMode } from "utils";
import { useAppSelector } from "state/storeHooks";

const calculateIsMaxCountReached = ({
  entityDef,
  parentEntityUuid,
  record,
}: any) => {
  const parentNode = parentEntityUuid
    ? Records.getNodeByUuid(parentEntityUuid)(record)
    : null;
  if (!parentNode) return false;

  const maxCount = Nodes.getChildrenMaxCount({
    parentNode,
    nodeDef: entityDef,
  });
  if (Objects.isEmpty(maxCount)) return false;

  const siblings = Records.getChildren(parentNode, entityDef.uuid)(record);
  return siblings.length >= maxCount;
};

const calculateHasCurrentEntityKeysSpecified = ({
  survey,
  entityDef,
  record,
  entityUuid,
}: any) => {
  const keyDefs = Surveys.getNodeDefKeys({ survey, nodeDef: entityDef });
  if (Objects.isEmpty(keyDefs)) return false;

  const entity = entityUuid ? Records.getNodeByUuid(entityUuid)(record) : null;
  if (!entity) return false;

  const keyValues = Records.getEntityKeyValues(survey, entity)(record);
  return !keyValues.some((keyValue) => Objects.isEmpty(keyValue));
};

// memoized: ancestor walks and key values evaluated only when the record or the current page change
const selectEntityNavigationInfo = createSelector(
  [
    SurveySelectors.selectCurrentSurvey,
    DataEntrySelectors.selectRecord,
    DataEntrySelectors.selectCurrentPageEntity,
  ],
  (survey, record, currentEntityPointer) => {
    const { entityDef, entityUuid, parentEntityUuid } = currentEntityPointer;
    return {
      prevEntityPointer: RecordPageNavigator.getPrevEntityPointer({
        survey,
        record,
        currentEntityPointer,
      }),
      nextEntityPointer: RecordPageNavigator.getNextEntityPointer({
        survey,
        record,
        currentEntityPointer,
      }),
      maxCountReached: calculateIsMaxCountReached({
        entityDef,
        parentEntityUuid,
        record,
      }),
      hasCurrentEntityKeysSpecified: calculateHasCurrentEntityKeysSpecified({
        survey,
        entityDef,
        record,
        entityUuid,
      }),
    };
  },
);

export const useBottomNavigationBar = () =>
  useAppSelector((state) => {
    const currentEntityPointer =
      DataEntrySelectors.selectCurrentPageEntity(state);
    const childDefs =
      DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(state);
    const activeChildIndex =
      DataEntrySelectors.selectCurrentPageEntityActiveChildDefIndex(state);
    const { entityDef, entityUuid, parentEntityUuid } = currentEntityPointer;

    const viewMode = SurveyOptionsSelectors.selectRecordEditViewMode(state);
    const canEditRecord = DataEntrySelectors.selectCanEditRecord(state);
    const entityEditable = DataEntrySelectors.selectRecordNodePointerEditable({
      parentNodeUuid: parentEntityUuid,
      nodeDefUuid: entityDef.uuid,
    })(state);

    const {
      prevEntityPointer,
      nextEntityPointer,
      maxCountReached,
      hasCurrentEntityKeysSpecified,
    } = selectEntityNavigationInfo(state);

    const activeChildIsLastChild = activeChildIndex + 1 === childDefs.length;

    // no list of records in web preview mode
    const listOfRecordsButtonVisible =
      !PreviewMode.isActive &&
      NodeDefs.isRoot(entityDef) &&
      (viewMode !== RecordEditViewMode.oneNode || activeChildIndex === 0);

    const pageButtonsVisible = viewMode !== RecordEditViewMode.oneNode;

    const singleNodesButtonsVisible =
      viewMode === RecordEditViewMode.oneNode &&
      childDefs.length > 0 &&
      (!NodeDefs.isMultiple(entityDef) || entityUuid);

    const prevPageButtonVisible = pageButtonsVisible && prevEntityPointer;

    const nextPageButtonVisible =
      pageButtonsVisible &&
      nextEntityPointer &&
      !Objects.isEqual(nextEntityPointer, prevEntityPointer);

    const prevSingleNodeButtonVisible =
      singleNodesButtonsVisible && activeChildIndex > 0;

    const nextSingleNodeButtonVisible =
      singleNodesButtonsVisible &&
      activeChildIndex >= 0 &&
      !activeChildIsLastChild;

    const newButtonVisible =
      canEditRecord &&
      entityEditable &&
      pageButtonsVisible &&
      prevEntityPointer &&
      !!entityUuid &&
      NodeDefs.isMultiple(entityDef) &&
      !NodeDefs.isEnumerate(entityDef) &&
      !maxCountReached &&
      hasCurrentEntityKeysSpecified;

    return {
      activeChildIndex,
      listOfRecordsButtonVisible,
      newButtonVisible,
      nextEntityPointer,
      nextPageButtonVisible,
      nextSingleNodeButtonVisible,
      prevEntityPointer,
      prevPageButtonVisible,
      prevSingleNodeButtonVisible,
    };
  }, Objects.isEqual);

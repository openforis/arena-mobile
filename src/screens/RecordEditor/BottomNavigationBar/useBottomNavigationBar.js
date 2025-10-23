import { useSelector } from "react-redux";

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

const calculateIsMaxCountReached = ({
  entityDef,
  parentEntityUuid,
  record,
}) => {
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
}) => {
  const keyDefs = Surveys.getNodeDefKeys({ survey, nodeDef: entityDef });
  if (Objects.isEmpty(keyDefs)) return false;

  const entity = entityUuid ? Records.getNodeByUuid(entityUuid)(record) : null;
  if (!entity) return false;

  const keyValues = Records.getEntityKeyValues({ survey, record, entity });
  return !keyValues.some((keyValue) => Objects.isEmpty(keyValue));
};

export const useBottomNavigationBar = () =>
  useSelector((state) => {
    const survey = SurveySelectors.selectCurrentSurvey(state);
    const record = DataEntrySelectors.selectRecord(state);
    const currentEntityPointer =
      DataEntrySelectors.selectCurrentPageEntity(state);
    const childDefs =
      DataEntrySelectors.selectCurrentPageEntityRelevantChildDefs(state);
    const activeChildIndex =
      DataEntrySelectors.selectCurrentPageEntityActiveChildDefIndex(state);
    const { entityDef, entityUuid, parentEntityUuid } = currentEntityPointer;

    const viewMode = SurveyOptionsSelectors.selectRecordEditViewMode(state);
    const canEditRecord = DataEntrySelectors.selectCanEditRecord(state);

    const prevEntityPointer = RecordPageNavigator.getPrevEntityPointer({
      survey,
      record,
      currentEntityPointer,
    });
    const nextEntityPointer = RecordPageNavigator.getNextEntityPointer({
      survey,
      record,
      currentEntityPointer,
    });
    const maxCountReached = calculateIsMaxCountReached({
      entityDef,
      parentEntityUuid,
      record,
    });
    const hasCurrentEntityKeysSpecified =
      calculateHasCurrentEntityKeysSpecified({
        survey,
        entityDef,
        record,
        entityUuid,
      });

    const activeChildIsLastChild = activeChildIndex + 1 === childDefs.length;

    const listOfRecordsButtonVisible =
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

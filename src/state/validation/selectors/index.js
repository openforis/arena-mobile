import {RecordValidations} from '@openforis/arena-core';
import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {keySelectors, EMPTY_OBJECT} from 'infra/stateUtils';

const getState = state => state;

const getValidationState = createSelector(
  getState,
  state => state?.validation || EMPTY_OBJECT,
);

// --- Validation
const getValidation = createSelector(
  getValidationState,
  formState => formState.validation || EMPTY_OBJECT,
);

const getValidationByKeys = ({keys, validation}) => {
  return keys
    ?.map(nodeUuid =>
      RecordValidations.getValidationNode({
        nodeUuid,
      })(validation),
    )
    .reduce((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    }, EMPTY_OBJECT);
};

const _getNodesUuids = (_, nodesUuids) => nodesUuids;

const getValidationByNodes = createCachedSelector(
  [getValidation, _getNodesUuids],
  (validation, nodesUuids) =>
    getValidationByKeys({keys: nodesUuids, validation}),
)(keySelectors.joinItems);

export default {
  getValidation,
  getValidationByNodes,
};

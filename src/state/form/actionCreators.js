import {createActions} from 'redux-actions';

import types from './actionTypes';

const {form} = createActions({
  [types.leaveForm$]: () => ({}),
  [types.deleteRecordIfNotModified$]: () => ({}),
  [types.SET_RECORD]: ({record}) => ({record}),

  [types.SET_PARENT_ENTITY_NODE]: ({node}) => ({
    node: {
      uuid: node?.uuid,
      nodeDefUuid: node?.nodeDefUuid,
    },
  }),
  [types.setNode$]: ({node}) => ({node}),
  [types.SET_NODE_TO_EDIT]: ({node}) => ({node}),

  [types.initializeRecord$]: () => ({}),
  [types.continueRecord$]: ({record}) => ({record}),
  [types.createEntity$]: ({nodeDef = false, node = false} = {}) => ({
    nodeDef,
    node,
  }),
  [types.selectEntity$]: ({nodeDef = false} = {}) => ({nodeDef}),
  [types.selectEntityNode$]: ({node = false}) => ({node}),

  [types.deleteNodeEntity$]: ({node}) => ({node}),
  [types.CLEAN]: () => ({}),
  [types.TOGGLE_ENTITY_SELECTOR]: () => ({}),
  [types.CLOSE_ENTITY_SELECTOR]: () => ({}),
  [types.TOGGLE_ENTITY_SHOW_AS_TABLE]: () => ({}),
  [types.TOGGLE_SINGLE_NODE_VIEW]: () => ({}),
  [types.SET_SHOW_MULTIPLE_ENTITY_HOME]: ({
    showMultipleEntityHome = false,
  }) => ({
    showMultipleEntityHome,
  }),
  /* PREFS */
  [types.SET_HAS_TO_JUMP]: ({hasToJump}) => ({hasToJump}),
  [types.SET_HAS_TO_LOCK_RECORDS_WHEN_LEAVE]: ({
    hasToLockRecordsWhenLeave,
  }) => ({
    hasToLockRecordsWhenLeave,
  }),
  [types.SET_HAS_TO_SHOW_NOT_RELEVANT_ON_NAVIGATION_TREE]: ({
    hasToShowNotRelevantOnNavigationTree,
  }) => ({
    hasToShowNotRelevantOnNavigationTree,
  }),
  [types.SET_SHOW_DESCRIPTIONS]: ({showDescriptions}) => ({showDescriptions}),
  [types.TOGGLE_SHOW_CLOSE_BUTTON_IN_FORM]: () => ({}),

  /* UI */
  [types.SET_LOADING]: ({isLoading = false}) => ({isLoading}),
  [types.importRecords$]: () => ({}),
});

export default form;

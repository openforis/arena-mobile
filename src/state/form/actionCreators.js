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
  /* PREFS */
  [types.SET_HAS_TO_JUMP]: ({hasToJump}) => ({hasToJump}),
  [types.SET_HAS_TO_LOCK_RECORDS_WHEN_LEAVE]: ({
    hasToLockRecordsWhenLeave,
  }) => ({
    hasToLockRecordsWhenLeave,
  }),
  [types.SET_SHOW_DESCRIPTIONS]: ({showDescriptions}) => ({showDescriptions}),
  /* VALIDATION */
  [types.SET_VALIDATION]: ({validation}) => ({validation}),
  [types.importRecords$]: () => ({}),
});

export default form;

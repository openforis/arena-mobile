const leaveForm$ = 'form/leaveForm$';
const deleteRecordIfNotModified$ = 'form/deleteRecordIfNotModified$';
const SET_RECORD = 'form/SET_RECORD';
const SET_PARENT_ENTITY_NODE = 'form/SET_PARENT_ENTITY_NODE';

const setNode$ = 'form/SET_NODE$';
const SET_NODE_TO_EDIT = 'form/SET_NODE_TO_EDIT';

const initializeRecord$ = 'form/initializeRecord$';
const continueRecord$ = 'form/continueRecord$';
const createEntity$ = 'form/createEntity$';
const selectEntity$ = 'form/selectEntity$';
const selectEntityNode$ = 'form/selectEntityNode$';
const deleteNodeEntity$ = 'form/deleteNodeEntity$';

const importRecords$ = 'form/importRecords$';

const CLEAN = 'form/CLEAN';

// UI
const TOGGLE_ENTITY_SELECTOR = 'form/TOGGLE_ENTITY_SELECTOR';
const CLOSE_ENTITY_SELECTOR = 'form/CLOSE_ENTITY_SELECTOR';
const TOGGLE_ENTITY_SHOW_AS_TABLE = 'form/TOGGLE_ENTITY_SHOW_AS_TABLE';
const TOGGLE_SINGLE_NODE_VIEW = 'form/TOGGLE_SINGLE_NODE_VIEW';
const SET_SHOW_MULTIPLE_ENTITY_HOME = 'form/SET_SHOW_MULTIPLE_ENTITY_HOME';
const SET_LOADING = 'form/SET_LOADING';

// PREFERENCES
const SET_HAS_TO_JUMP = 'form/SET_HAS_TO_JUMP';
const SET_HAS_TO_LOCK_RECORDS_WHEN_LEAVE =
  'form/SET_HAS_TO_LOCK_RECORDS_WHEN_LEAVE';
const SET_SHOW_DESCRIPTIONS = 'form/SET_SHOW_DESCRIPTIONS';
const TOGGLE_SHOW_CLOSE_BUTTON_IN_FORM =
  'form/TOGGLE_SHOW_CLOSE_BUTTON_IN_FORM';

export default {
  leaveForm$,
  deleteRecordIfNotModified$,

  SET_RECORD,
  SET_PARENT_ENTITY_NODE,

  setNode$,
  SET_NODE_TO_EDIT,

  initializeRecord$,
  continueRecord$,
  createEntity$,
  selectEntity$,
  selectEntityNode$,

  deleteNodeEntity$,

  CLEAN,

  /* UI */

  TOGGLE_ENTITY_SELECTOR,
  CLOSE_ENTITY_SELECTOR,
  TOGGLE_ENTITY_SHOW_AS_TABLE,
  TOGGLE_SINGLE_NODE_VIEW,
  SET_SHOW_MULTIPLE_ENTITY_HOME,

  /* PREFS */
  SET_HAS_TO_JUMP,
  SET_HAS_TO_LOCK_RECORDS_WHEN_LEAVE,
  SET_SHOW_DESCRIPTIONS,
  TOGGLE_SHOW_CLOSE_BUTTON_IN_FORM,

  importRecords$,
};

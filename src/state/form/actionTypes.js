const leaveForm$ = 'form/leaveForm$';
const SET_RECORD = 'form/SET_RECORD';
const SET_PARENT_ENTITY_NODE = 'form/SET_PARENT_ENTITY_NODE';
const SET_NODE = 'form/SET_NODE';

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

// PREFERENCES
const SET_HAS_TO_JUMP = 'form/SET_HAS_TO_JUMP';

// VALIDATION
const SET_VALIDATION = 'form/SET_VALIDATION';

export default {
  leaveForm$,

  SET_RECORD,
  SET_PARENT_ENTITY_NODE,
  SET_NODE,

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

  /* PREFS */
  SET_HAS_TO_JUMP,

  /* VALIDATION */
  SET_VALIDATION,

  importRecords$,
};

const initialState = {
  data: {
    record: null,
    parentEntityNode: null,
    parentEntityNodeDef: null,
    node: null,
    nodeDef: null,
  },
  ui: {
    isEntitySelectorOpened: false,
    isEntityShowAsTable: false,
    isSingleNodeView: false,
  },
  preferences: {
    hasToJump: false,
    hasToLockRecordsWhenLeave: true,
    showDescriptions: true,
  },
  validation: {},
};

export default initialState;

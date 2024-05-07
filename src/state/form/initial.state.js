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
    showMultipleEntityHome: false,
    isLoading: false,
  },
  preferences: {
    hasToJump: false,
    hasToLockRecordsWhenLeave: true,
    showDescriptions: true,
    isSingleNodeView: false,
    showCloseButtonInForm: true,
  },
};

export default initialState;

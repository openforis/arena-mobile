const treeNodeDefs = {
  TREE_UUID: {
    id: 'TREE_ID',
    uuid: 'TREE_UUID',
    parentUuid: 'PLOT_UUID',
    type: 'entity',
    props: {
      name: 'tree',
      multile: true,
    },
  },
  TREE_KEY_UUID: {
    id: 'TREE_KEY_ID',
    uuid: 'TREE_KEY_UUID',
    parentUuid: 'TREE_UUID',
    type: 'integer',
    props: {
      key: true,
      name: 'tree_key',
      multile: false,
    },
  },
};

export default treeNodeDefs;

const nodeDefs = {
  PLOT_UUID: {
    id: 'PLOT_ID',
    uuid: 'PLOT_UUID',
    parentUuid: 'CLUSTER_UUID',
    type: 'entity',
    props: {
      name: 'plot',
      multile: true,
    },
  },
  PLOT_KEY_UUID: {
    id: 'PLOT_KEY_ID',
    uuid: 'PLOT_KEY_UUID',
    parentUuid: 'PLOT_UUID',
    type: 'integer',
    props: {
      key: true,
      name: 'plot_key',
      multile: false,
    },
  },
};

export default nodeDefs;

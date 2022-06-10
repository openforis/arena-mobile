const nodeDefs = {
  CLUSTER_UUID: {
    id: 'CLUSTER_ID',
    uuid: 'CLUSTER_UUID',
    parentUuid: null,
    type: 'entity',
    props: {
      name: 'cluster',
      multile: false,
    },
  },
  CLUSTER_KEY_UUID: {
    id: 'CLUSTER_KEY_ID',
    uuid: 'CLUSTER_KEY_UUID',
    parentUuid: 'CLUSTER_UUID',
    type: 'integer',
    props: {
      key: true,
      name: 'cluster_key',
      multile: false,
    },
  },
  CLUSTER_NAME_UUID: {
    id: 'CLUSTER_NAME_ID',
    uuid: 'CLUSTER_NAME_UUID',
    parentUuid: 'CLUSTER_UUID',
    type: 'text',
    props: {
      name: 'cluster_name',
      multile: false,
    },
  },
};

export default nodeDefs;

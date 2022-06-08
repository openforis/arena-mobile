import getCurrentUuid from '../../../utils/getCurrentUuid';
import mockNode from '../../node';

import clusterNodeDefs from './nodeDefs';

const cluster = {
  nodeDefs: clusterNodeDefs,
  new: ({currentIndex}) => {
    const clusterNode = {
      ...mockNode({
        index: currentIndex,
        parentNode: null,
        nodeDefUuid: 'CLUSTER_UUID',
      }),
    };
    return {
      [clusterNode.uuid]: {
        ...clusterNode,
      },
      [getCurrentUuid(currentIndex + 1)]: {
        ...mockNode({
          index: currentIndex + 1,
          parentNode: clusterNode,
          nodeDefUuid: 'CLUSTER_KEY_UUID',
        }),
      },
      [getCurrentUuid(currentIndex + 2)]: {
        ...mockNode({
          index: currentIndex + 2,
          parentNode: clusterNode,
          nodeDefUuid: 'CLUSTER_NAME_UUID',
        }),
      },
    };
  },
};
export default cluster;

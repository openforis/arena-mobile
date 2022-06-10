import getCurrentUuid from '../../../utils/getCurrentUuid';
import mockNode from '../../node';

import treeNodeDefs from './nodeDefs';

const tree = {
  nodeDefs: treeNodeDefs,
  new: ({parentIndex, currentIndex, prevState}) => {
    const entityParentUuid = getCurrentUuid(parentIndex);
    const entityParent = prevState.nodes.data?.[entityParentUuid];

    const treeNode = {
      ...mockNode({
        index: currentIndex,
        parentNode: entityParent,
        nodeDefUuid: 'TREE_UUID',
      }),
    };

    const treeKeyNode = {
      ...mockNode({
        index: currentIndex + 1,
        parentNode: treeNode,
        nodeDefUuid: 'TREE_KEY_UUID',
      }),
    };

    return {
      [treeNode.uuid]: {...treeNode},
      [treeKeyNode.uuid]: {
        ...treeKeyNode,
      },
    };
  },
};
export default tree;

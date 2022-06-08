import getCurrentUuid from '../../../utils/getCurrentUuid';
import mockNode from '../../node';

import plotNodeDefs from './nodeDefs';

const plot = {
  nodeDefs: plotNodeDefs,
  new: ({parentIndex, currentIndex, prevState}) => {
    const entityParentUuid = getCurrentUuid(parentIndex);
    const entityParent = prevState.nodes.data?.[entityParentUuid];

    const plotNode = {
      ...mockNode({
        index: currentIndex,
        parentNode: entityParent,
        nodeDefUuid: 'PLOT_UUID',
      }),
    };

    return {
      [plotNode.uuid]: {
        ...plotNode,
      },
      [getCurrentUuid(currentIndex + 1)]: {
        ...mockNode({
          index: currentIndex + 1,
          parentNode: plotNode,
          nodeDefUuid: 'PLOT_KEY_UUID',
        }),
      },
    };
  },
};
export default plot;

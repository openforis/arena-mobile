const deleteNodes = ({nodeIndexesToDelete = []}, _prevState = {}) => {
  let nodes = {..._prevState.nodes.data};

  nodeIndexesToDelete.forEach(nodeKey => {
    delete nodes[nodeKey];
  });

  return {
    ..._prevState,
    nodes: {
      ..._prevState.nodes,
      data: {
        ...nodes,
      },
    },
  };
};

export default deleteNodes;

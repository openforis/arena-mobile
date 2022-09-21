export const getRecordKey = (nodes, nodeDefRoot, nodeDefsByUuid) => {
  const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot.uuid);
  const keyRootNodes = nodes.filter(
    node =>
      node.parentUuid === rootNode.uuid &&
      nodeDefsByUuid[node.nodeDefUuid].props.key,
  );

  return keyRootNodes.map(node => node.value || '-').join('/');
};

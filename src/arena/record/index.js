export const getKeyNodeAsString = ({
  node,
  categoryItemIndex,
  defaultString = '',
}) => {
  if (node?.value?.itemUuid) {
    const code = categoryItemIndex?.[node?.value?.itemUuid]?.props?.code;
    return code || defaultString;
  }
  return node.value || defaultString;
};

export const getKeyNodesAsString = ({
  nodes = [],
  categoryItemIndex,
  joinString = ',',
  defaultString = '',
}) =>
  nodes
    .map(nodeKey =>
      getKeyNodeAsString({node: nodeKey, categoryItemIndex, defaultString}),
    )
    .join(joinString) || '';

export const getKeyNodesForEntity = ({entity, nodes, nodeDefsByUuid}) => {
  const keyNodes = nodes.filter(
    node =>
      node.parentUuid === entity.uuid &&
      nodeDefsByUuid[node.nodeDefUuid].props.key,
  );
  return keyNodes;
};

export const getKeyNodesForEntityAsString = ({
  entity,
  nodes,
  nodeDefsByUuid,
  categoryItemIndex,
}) => {
  const keyNodes = nodes.filter(
    node =>
      node.parentUuid === entity.uuid &&
      nodeDefsByUuid[node.nodeDefUuid].props.key,
  );

  return getKeyNodesAsString({
    nodes: keyNodes,
    categoryItemIndex,
  });
};

export const getRecordKey = (
  nodes,
  nodeDefRoot,
  nodeDefsByUuid,
  categoryItemIndex,
) => {
  const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot.uuid);

  const keyRootNodes = getKeyNodesForEntity({
    entity: rootNode,
    nodes,
    nodeDefsByUuid,
  });

  return getKeyNodesAsString({
    nodes: keyRootNodes,
    defaultString: '-',
    joinString: '/',
    categoryItemIndex,
  });
};

export const getRecordSummary = record => {
  const keysWhitelist = [
    'uuid',
    'recordKey',
    'dateCreated',
    'dateModified',
    'surveyUuid',
    'cycle',
  ];

  const recordSummary = {};
  keysWhitelist.forEach(key => {
    recordSummary[key] = record[key];
  });

  return recordSummary;
};

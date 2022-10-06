export const getRecordKey = (nodes, nodeDefRoot, nodeDefsByUuid) => {
  const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot.uuid);
  const keyRootNodes = nodes.filter(
    node =>
      node.parentUuid === rootNode.uuid &&
      nodeDefsByUuid[node.nodeDefUuid].props.key,
  );

  return keyRootNodes.map(node => node.value || '-').join('/');
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

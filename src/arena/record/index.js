import {Objects} from 'infra/objectUtils';

const DEFAULT_JOIN_STRING = ',';
const DEFAULT_STRING = '';
const DEFAULT_EMPTY_ARRAY = [];

const allKeysEmpty = ({nodes = DEFAULT_EMPTY_ARRAY}) =>
  nodes.every(node => Objects.isEmpty(node.value));

export const getKeyNodeAsString = ({
  node,
  categoryItemIndex,
  defaultString = DEFAULT_STRING,
}) => {
  if (node?.value?.itemUuid) {
    const code = categoryItemIndex?.[node?.value?.itemUuid]?.props?.code;
    return code || defaultString;
  }
  return Objects.isEmpty(node.value) ? defaultString : node.value;
};

export const getKeyNodesAsString = ({
  nodes = DEFAULT_EMPTY_ARRAY,
  categoryItemIndex,
  joinString = DEFAULT_JOIN_STRING,
  defaultString = DEFAULT_STRING,
}) =>
  nodes
    .map(nodeKey =>
      getKeyNodeAsString({node: nodeKey, categoryItemIndex, defaultString}),
    )
    .join(joinString) || '';

export const getKeyNodesForEntity = ({
  entity,
  nodes = DEFAULT_EMPTY_ARRAY,
  nodeDefsByUuid,
}) =>
  nodes.filter(
    node =>
      node.parentUuid === entity.uuid &&
      nodeDefsByUuid[node.nodeDefUuid].props.key,
  );

export const getKeyNodesForEntityAsString = ({
  entity,
  nodes,
  nodeDefsByUuid,
  categoryItemIndex,
  joinString = DEFAULT_JOIN_STRING,
  defaultString = DEFAULT_STRING,
  defaultEmptyString,
}) => {
  const keyNodes = getKeyNodesForEntity({entity, nodes, nodeDefsByUuid});
  const areAllKeysEmpty = allKeysEmpty({nodes: keyNodes});

  if (areAllKeysEmpty) {
    return defaultEmptyString;
  }

  return getKeyNodesAsString({
    nodes: keyNodes,
    categoryItemIndex,
    defaultString,
    joinString,
  });
};

export const getRecordKey = (
  nodes,
  nodeDefRoot,
  nodeDefsByUuid,
  categoryItemIndex,
) => {
  const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot?.uuid);

  return getKeyNodesForEntityAsString({
    entity: rootNode,
    nodes,
    nodeDefsByUuid,
    categoryItemIndex,
    defaultString: '-',
    joinString: '/',
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

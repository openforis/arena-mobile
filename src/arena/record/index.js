import {Records} from '@openforis/arena-core';
import moment from 'moment';

import {Objects} from 'infra/objectUtils';

const DEFAULT_JOIN_STRING = ',';
const DEFAULT_STRING = '';
const DEFAULT_EMPTY_ARRAY = [];

const allKeysEmpty = ({nodes = DEFAULT_EMPTY_ARRAY}) =>
  nodes.every(node => Objects.isEmpty(node.value));

const getKeyNodeAsString = ({
  node,
  categoryItemIndex,
  taxonIndex,
  defaultString = DEFAULT_STRING,
  language,
  showLabels = false,
}) => {
  if (node?.value?.itemUuid) {
    const code = categoryItemIndex?.[node?.value?.itemUuid]?.props?.code;
    let label = false;
    if (showLabels) {
      label =
        categoryItemIndex?.[node?.value?.itemUuid]?.props?.labels?.[language];
    }

    return label || code || defaultString;
  }

  if (node?.value?.taxonUuid) {
    const code = taxonIndex?.[node?.value?.taxonUuid]?.props?.code;
    return code || defaultString;
  }

  return Objects.isEmpty(node.value) ? defaultString : node.value;
};

export const getKeyNodesAsString = ({
  nodes = DEFAULT_EMPTY_ARRAY,
  categoryItemIndex,
  taxonIndex,
  joinString = DEFAULT_JOIN_STRING,
  defaultString = DEFAULT_STRING,
  showLabels,
  language,
}) =>
  nodes
    .map(nodeKey =>
      getKeyNodeAsString({
        node: nodeKey,
        categoryItemIndex,
        defaultString,
        taxonIndex,
        showLabels,
        language,
      }),
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

  taxonIndex,
  joinString = DEFAULT_JOIN_STRING,
  defaultString = DEFAULT_STRING,
  defaultEmptyString,

  showLabels,
  language,
}) => {
  const keyNodes = getKeyNodesForEntity({entity, nodes, nodeDefsByUuid});
  const areAllKeysEmpty = allKeysEmpty({nodes: keyNodes});

  if (areAllKeysEmpty) {
    return defaultEmptyString;
  }

  return getKeyNodesAsString({
    nodes: keyNodes,
    categoryItemIndex,

    taxonIndex,
    defaultString,
    joinString,

    showLabels,
    language,
  });
};

export const getRecordKey = (
  nodes,
  nodeDefRoot,
  nodeDefsByUuid,
  categoryItemIndex,

  taxonIndex,

  showLabels = false,
  language = false,
) => {
  const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot?.uuid);

  return getKeyNodesForEntityAsString({
    entity: rootNode,
    nodes,
    nodeDefsByUuid,
    categoryItemIndex,

    taxonIndex,
    defaultString: '-',
    joinString: '/',

    showLabels,
    language,
  });
};

export const getRecordKeyWithLabel = (
  nodes,
  nodeDefRoot,
  nodeDefsByUuid,
  categoryItemIndex,

  taxonIndex,
  language,
) => {
  const showLabels = true;

  return getRecordKey(
    nodes,
    nodeDefRoot,
    nodeDefsByUuid,
    categoryItemIndex,

    taxonIndex,

    showLabels,
    language,
  );
};

export const getRecordSummary = record => {
  const keysWhitelist = [
    'uuid',
    'recordKey',
    'recordKeyWithLabel',
    'dateCreated',
    'dateModified',
    'dateSynced', // TODO change
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

export const recordStatus = {
  new: 'new',
  modifiedLocally: 'modifiedLocally',
  modifiedRemotely: 'modifiedRemotely',
  notModified: 'notModified',
  notInEntryStepAnymore: 'notInEntryStepAnymore',
};

export const getLocalRecordStatus = ({record, recordRemoteSummary}) => {
  // check if all keys are ready

  if (!recordRemoteSummary) {
    return recordStatus.new;
  }

  if (recordRemoteSummary.step > 1) {
    return recordStatus.notInEntryStepAnymore;
  }

  if (
    moment(record?.dateModified)
      .second(0)
      .millisecond(0)
      .isAfter(
        moment(recordRemoteSummary?.dateModified).second(0).millisecond(0),
      )
  ) {
    return recordStatus.modifiedLocally;
  }

  if (
    moment(record?.dateModified)
      .second(0)
      .millisecond(0)
      .isBefore(
        moment(recordRemoteSummary?.dateModified).second(0).millisecond(0),
      )
  ) {
    return recordStatus.modifiedRemotely;
  }

  return recordStatus.notModified;
};

export const joinRecordItems = ({record, nodesByUuid, validation}) => {
  const recordWithNodes = Records.addNodes(nodesByUuid || {})(record);
  const fullRecord = {...recordWithNodes, validation};
  return fullRecord;
};

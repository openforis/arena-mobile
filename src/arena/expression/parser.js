const getNodeDefUuidsByName = ({survey}) => {
  const nodeDefsByUuid = survey.nodeDefs;
  return Object.keys(nodeDefsByUuid).reduce((acc, nodeDefUuid) => {
    return {
      ...acc,
      [nodeDefsByUuid[nodeDefUuid].props.name]: nodeDefUuid,
    };
  }, {});
};

const getNodeParents = ({node, record}) => {
  let parentsUuids = [];
  const nodes = record.nodes;
  if (node.parentUuid) {
    const parentNode = nodes[node.parentUuid];
    parentsUuids = [
      node.parentUuid,
      ...getNodeParents({node: parentNode, record}),
    ];
  }
  return parentsUuids;
};

const getNodeSibilings = ({node, record}) => {
  return Object.values(record.nodes)
    .filter(
      _node => _node.parentUuid === node.parentUuid && node.uuid !== _node.uuid,
    )
    .map(_node => _node.uuid);
};

const getRelativeNodeByNodeDefUuid = ({node, record, nodeDefUuid}) => {
  const nodesByNodeDefUuid = Object.values(record.nodes).filter(
    _node => _node.nodeDefUuid === nodeDefUuid,
  );

  // Maybe more efficient if we pass only the nodesFilteredByNodeDef
  const ancestorsNodeUuids = getNodeParents({node, record});
  const sibilingsNodeUuids = getNodeSibilings({node, record});

  return nodesByNodeDefUuid.find(
    _node =>
      ancestorsNodeUuids.includes(_node.parentUuid) ||
      sibilingsNodeUuids.includes(_node.parentUuid) ||
      _node.parentUuid === null,
  );
};

const getValueToExpression = ({node, survey}) => {
  const nodeDefsByUuid = survey.nodeDefs;
  const nodeDef = nodeDefsByUuid[node.nodeDefUuid];
  if (nodeDef.type === 'text') {
    return `"${node.value}"`;
  }
  return node.value;
};
const _parseArenaExpression = ({expression, node, survey, record}) => {
  const nodeDefsUuidsByName = getNodeDefUuidsByName({survey});
  const nodeDefsByUuid = survey.nodeDefs;

  let jsExpression = expression;
  /* HERE is where we should replace the MemberExpression and Identifiers with the 'raw' value  */
  Object.keys(nodeDefsUuidsByName).forEach(nodeDefName => {
    const hasNodeDef = jsExpression.includes(nodeDefName);
    // not entity nodeDefs
    if (
      hasNodeDef &&
      nodeDefsByUuid[nodeDefsUuidsByName[nodeDefName]].type !== 'entity'
    ) {
      const nodeDefUuid = nodeDefsUuidsByName[nodeDefName];
      const relativeNode = getRelativeNodeByNodeDefUuid({
        node,
        survey,
        record,
        nodeDefUuid,
      });

      jsExpression = jsExpression.replace(
        nodeDefName,
        getValueToExpression({node: relativeNode, survey}),
      );
    }
  });

  return jsExpression;
};

const _getNodeExpressions = ({node, survey, type = 'ALL'}) => {
  const nodeDefsByUuid = survey.nodeDefs;
  let expressions = [];
  const nodeDefAdvancedProps = nodeDefsByUuid[node.nodeDefUuid]?.propsAdvanced;

  if (type === 'VALIDATIONS') {
    expressions = nodeDefAdvancedProps?.validations?.expressions || [];
  }

  if (type === 'APPLICABLE') {
    expressions = nodeDefAdvancedProps?.applicable || [];
  }
  if (type === 'DEFAULT_VALUES' && node.updatedBy !== 'USER') {
    expressions = nodeDefAdvancedProps?.defaultValues || [];
  }

  if (type === 'ALL') {
    expressions = [
      ...(nodeDefAdvancedProps?.validations?.expressions || []),
      ...(nodeDefAdvancedProps?.applicable || []),
      ...(node.updatedBy !== 'USER'
        ? nodeDefAdvancedProps?.defaultValues || []
        : []),
    ];
  }
  return expressions;
};

export const prepareArenaExpressions = ({
  node,
  survey,
  record,
  type = 'VALIDATIONS',
}) => {
  return (
    _getNodeExpressions({node, survey, type})?.map(expression => {
      return {
        ...expression,
        jsExpression: _parseArenaExpression({
          expression: expression.expression,
          node,
          survey,
          record,
        }),
        jsApplyIf: _parseArenaExpression({
          expression: expression.applyIf,
          node,
          survey,
          record,
        }),
      };
    }) || []
  );
};

// ---------------

const checkIfNodeExpressionDependsOnReferenceNode = ({
  node,
  expression: _expression,
  survey,
  record,
  referenceNode,
}) => {
  const nodeDefsUuidsByName = getNodeDefUuidsByName({survey});
  const nodeDefsByUuid = survey.nodeDefs;
  const {expression, applyIf} = _expression;

  let found = false;

  Object.keys(nodeDefsUuidsByName).forEach(nodeDefName => {
    const hasNodeDef =
      expression.includes(nodeDefName) || applyIf.includes(nodeDefName);
    // not entity nodeDefs
    if (
      hasNodeDef &&
      nodeDefsByUuid[nodeDefsUuidsByName[nodeDefName]].type !== 'entity'
    ) {
      const nodeDefUuid = nodeDefsUuidsByName[nodeDefName];
      const relativeNode = getRelativeNodeByNodeDefUuid({
        node,
        survey,
        record,
        nodeDefUuid,
      });

      if (relativeNode.uuid === referenceNode.uuid) {
        found = true;
      }
    }
  });

  return found;
};

export const checkIfNodeExpressionsDependsOnReferenceNode = ({
  node,
  survey,
  record,
  type = 'ALL',
  referenceNode,
}) => {
  return _getNodeExpressions({node, survey, type})?.some(expression =>
    checkIfNodeExpressionDependsOnReferenceNode({
      node,
      expression,
      survey,
      record,
      referenceNode,
    }),
  );
};

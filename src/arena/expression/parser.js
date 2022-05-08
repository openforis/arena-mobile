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

const getRelativeNodeByNodeDefUuid = ({node, record, nodeDefUuid}) => {
  const nodesByNodeDefUuid = Object.values(record.nodes).filter(
    _node => _node.nodeDefUuid === nodeDefUuid,
  );
  const ancestorsNodeUuids = getNodeParents({node, record});

  return nodesByNodeDefUuid.find(
    _node =>
      ancestorsNodeUuids.includes(_node.parentUuid) ||
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

  let jsExpression = expression.replace();
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

export const prepareArenaExpressions = ({
  node,
  survey,
  record,
  type = 'VALIDATIONS',
}) => {
  const nodeDefsByUuid = survey.nodeDefs;
  let _expressions = [];

  if (type === 'VALIDATIONS') {
    _expressions =
      nodeDefsByUuid[node.nodeDefUuid].propsAdvanced?.validations?.expressions;
  }

  if (type === 'APPLICABLE') {
    _expressions = nodeDefsByUuid[node.nodeDefUuid].propsAdvanced?.applicable;
  }
  if (type === 'DEFAULT_VALUES') {
    _expressions =
      nodeDefsByUuid[node.nodeDefUuid].propsAdvanced?.defaultValues;
  }

  const expressions = _expressions?.map(expression => {
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
  });

  return expressions || [];
};

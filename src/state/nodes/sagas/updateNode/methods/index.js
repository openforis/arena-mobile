const {
  checkIfNodeExpressionsDependsOnReferenceNode,
} = require('arena/expression/parser');

const evalExpression = ({expression, node, record, survey}) => {
  // dode from arena -> const _getApplicableExpressions = (survey, record, nodeCtx, expressions, stopAtFirstFound = false) => {

  return node.value >= 0; //  error/warning(validationObject)
};
const validateNode = ({node, record, survey}) => {
  // vget Validation rules
  // get applicable validation rules
  // iterate over applicable rules
  // evaluate expression -> evalExpression
  return evalExpression({node}); //validationObject
};

const validateIfRootWithOtherRecords = () => true;

const getListOfDependants = ({node, record, survey}) => {
  /*(node, record[nodes], survey[nodeDefs] ) -> [] -> [nodes]
    seeing if the node is into the rules[validation, default, applicability] of the children/siblings nodes

    _nodes = []
    _node in record.nodes:
         if node in _node.nodeDef.rules()
            _nodes.push(node)

    _node = SET([])
        _node in record.nodes:
            if node.nodeDef() in _node.nodeDef.rules.dependantNodeDefs()*/

  let dependantNodes = [];
  dependantNodes = Object.values(record.nodes).filter(_node =>
    checkIfNodeExpressionsDependsOnReferenceNode({
      node: _node,
      survey,
      record,
      referenceNode: node,
    }),
  );

  // we need to filter and check if the applyIf is true and into the applicability and default we should return as node to Update

  return dependantNodes;
};

const updateDependantNodes = ({node, record: _record, survey}) => {
  let updatedNodes = [];
  let validatedNodes = {};
  let record = {..._record};

  // getListOfDependants ( it is going to be updated because you are going to go through the tree) -> it is queue
  const depentands = getListOfDependants({node, record, survey});

  for (let dependantNode in depentands) {
    // iterate over the nodes
    // 2.1 checkRules [ 1. Applicability, 2. default values if needed, 3 validation ]

    //2.1
    // if not relevant and was relevant
    //	mark as not relevant
    //	clean errors and warnings
    //  dont iterate over the children
    //	return
    // if relevant and was not relevant
    // __if value in t-1 was null
    // ____apply defualt

    const isValid = validateNode({
      node: dependantNode,
      record,
      survey,
    });

    const {
      updatedNodes: updatedDependants,
      validatedNodes: validatedDependantNodes,
    } = updateDependantNodes({
      node: dependantNode,
      record,
      survey,
    });

    validatedNodes = {
      ...validatedNodes,
      [dependantNode.uuid]: isValid ? false : {error: 'ERROR'},
      ...validatedDependantNodes,
    };
    updatedNodes.push(dependantNode, ...(updatedDependants || []));

    // Update record with new nodes -> if we use RecordNodes instead of nodes It could be simpler
    record = {
      ...record,
      nodes: {
        ...record.nodes,
        ...(updatedNodes || []).reduce(
          (acc, _node) => ({...acc, [_node.uuid]: {..._node}}),
          {},
        ),
      },
    };
  }

  return {updatedNodes, validatedNodes};
};

export const updateNodeAndDependats = ({node, record: _record, survey}) => {
  let validatedNodes = {};

  //recordWithUpdatedNode
  const record = {
    ..._record,
    nodes: {..._record.nodes, [node.uuid]: {...node}},
  };

  const isValid = validateNode({
    node,
    record,
    survey,
  });

  const {updatedNodes, validatedNodes: validatedDependantNodes} =
    updateDependantNodes({
      node,
      record,
      survey,
    });

  validatedNodes = {
    ...validatedNodes,
    [node.uuid]: isValid ? false : {error: 'ERROR'},
    ...validatedDependantNodes,
  };

  return {updatedNodes: [node, ...(updatedNodes || [])], validatedNodes};
};

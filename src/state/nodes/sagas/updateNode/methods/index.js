const {evalExpr} = require('jse-eval');

const {
  prepareArenaExpressions,
  checkIfNodeExpressionsDependsOnReferenceNode,
} = require('arena/expression/parser');

const evalArenaExpression = ({expression}) => {
  // dode from arena -> const _getApplicableExpressions = (survey, record, nodeCtx, expressions, stopAtFirstFound = false) => {

  return (
    (expression.jsApplyIf === '' || evalExpr(expression.jsApplyIf)) &&
    evalExpr(expression.jsExpression)
  );
};

const validateNode = ({node, record, survey}) => {
  // vget Validation rules
  const expressions = prepareArenaExpressions({node, survey, record});
  let errors = [];
  let warning = [];
  // get applicable validation rules
  // iterate over applicable rules
  // evaluate expression -> evalExpression
  expressions.forEach(expression => {
    if (!evalArenaExpression({expression})) {
      errors.push({error: 'ERROR'});
    }
  });
  // maybe wrap this evalExpr
  // evalExpression({node}); //validationObject

  return {errors: errors.length > 0 ? [errors[0]] : [], warning};
};

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
  dependantNodes = Object.values(record.nodes).filter(
    _node =>
      _node.uuid !== node.uuid &&
      checkIfNodeExpressionsDependsOnReferenceNode({
        node: _node,
        survey,
        record,
        referenceNode: node,
      }),
  );
  // we need to filter and check if the applyIf (or not because dependant nodes shpuld be cleaned) is true and into the applicability and default we should return as node to Update

  return dependantNodes;
};

const updateDependantNodes = ({node, record: _record, survey}) => {
  let updatedNodes = [];
  let errors = {};
  let warnings = {};
  let record = {..._record};

  // getListOfDependants ( it is going to be updated because you are going to go through the tree) -> it is queue
  const depentands = getListOfDependants({node, record, survey});

  depentands.forEach(dependantNode => {
    // iterate over the nodes
    // 2.1 checkRules [ 1. Applicability, 2. default values if needed, 3 validation ]

    //2.1
    // if not relevant and was relevant
    //	mark as not relevant
    //	clean errors and warnings
    //  dont iterate over the children
    //	return
    // if relevant and was not relevant
    // __if value in t-1 was null -> or not edited by user
    // ____apply defualt

    const {errors: _errors = [], warnings: _warnings = []} = validateNode({
      node: dependantNode,
      record,
      survey,
    });

    const {updatedNodes: updatedDependants, depentantErrors} =
      updateDependantNodes({
        node: dependantNode,
        record,
        survey,
      });

    errors = {
      ...errors,
      [dependantNode.uuid]: _errors,
      ...depentantErrors,
    };
    updatedNodes.push(dependantNode, ...(updatedDependants || []));

    // Update record with new nodes -> if we use RecordNodes instead of nodes It could be simpler
    record = {
      ...record,
      nodes: {
        ...record.nodes,
        ...(updatedNodes || []).reduce((acc, _node) => {
          return {...acc, [_node.uuid]: {..._node}};
        }, {}),
      },
    };
  });

  return {updatedNodes, depentantErrors: errors, dependantWarnings: warnings};
};

export const updateNodeAndDependats = ({node, record: _record, survey}) => {
  let warnings = {};
  let errors = {};

  //recordWithUpdatedNode
  const record = {
    ..._record,
    nodes: {..._record.nodes, [node.uuid]: {...node}},
  };

  const {errors: _errors, warnings: _warnings} = validateNode({
    node,
    record,
    survey,
  });

  const {updatedNodes, depentantErrors, dependantWarnings} =
    updateDependantNodes({
      node,
      record,
      survey,
    });

  // rename to errors
  errors = {
    ...errors,
    [node.uuid]: _errors,
    ...depentantErrors,
  };

  //
  warnings = {
    ...warnings,
    [node.uuid]: _warnings,
    ...dependantWarnings,
  };

  return {updatedNodes: [node, ...(updatedNodes || [])], errors, warnings};
};

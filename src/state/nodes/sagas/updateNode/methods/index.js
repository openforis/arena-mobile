const evalExpression = ({expression, node, record, nodes, nodeDefs}) => {
  return; //  error/warning(validationObject)
};
const validateNode = ({node, record, nodes, nodeDefs}) => {
  // vget Validation rules
  // get applicable validation rules
  // iterate over applicable rules
  // evaluate expression -> evalExpression
  evalExpression({node});
  return node; //validationObject
};

const validateIfRootWithOtherRecords = () => true;

const getListOfDependants = ({node, record, recordNodes, nodeDefs}) => {
  /*(node, record[nodes], survey[nodeDefs] ) -> [] -> [nodes]
    seeing if the node is into the rules[validation, default, applicability] of the children/siblings nodes

    _nodes = []
    _node in record.nodes:
         if node in _node.nodeDef.rules()
            _nodes.push(node)



    _node = SET([])
        _node in record.nodes:
            if node.nodeDef() in _node.nodeDef.rules.dependantNodeDefs()*/

  return [];
};

const updateDependantNodes = ({nodeDefs, node, record, nodes}) => {
  let updatedNodes = [];
  // getListOfDependants ( it is going to be updated because you are going to go through the tree) -> it is queue
  const depentands = getListOfDependants({node, record, nodes, nodeDefs});

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

    const validatedNode = validateNode({
      node: dependantNode,
      record,
      nodes,
      nodeDefs,
    });

    const updatedDependants = updateDependantNodes({
      node: validatedNode,
      record,
      nodes,
      nodeDefs,
    });

    updatedNodes.push(validatedNode, ...(updatedDependants || []));
  }

  return updatedNodes;
};

export const updateNodeAndDependats = ({
  updatedNode,
  recordNodes: nodes,
  record,
  nodeDefs,
}) => {
  const validatedNode = validateNode({
    node: updatedNode,
    record,
    nodes,
    nodeDefs,
  });
  const updatedDependants = updateDependantNodes({
    node: validatedNode,
    record,
    nodes,
    nodeDefs,
  });

  return {updateNodes: [validatedNode, ...(updatedDependants || [])]};
};

import {call} from 'redux-saga/effects';

// (expression, node, records and nodes [t + 1], survey[nodeDefs] ) -> [evalExpression] ->  error/warning(validationObject)
function* evalExpression({payload}) {
  const {expression, node, record, nodes, nodeDefs} = payload;
  return;
}
function* validateNode({payload}) {
  const {nodeUpdate, record, nodes, nodeDefs} = payload;
  // vget Validation rules
  // get applicable validation rules
  // iterate over applicable rules
  // evaluate expression -> evalExpression
  yield call(evalExpression, {nodeDefs});
  // return validationObject
}

function* validateIfRoot({payload}) {
  return true;
}

function* getListOfDependants({payload}) {
  const {node, record, recordNodes, nodeDefs} = payload;
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
}

function* updateDependantNodes({payload}) {
  const {nodeDefs, node, record, nodes} = payload;

  // getListOfDependants ( it is going to be updated because you are going to go through the tree) -> it is queue
  const depentands = yield call(getListOfDependants, {
    node,
    record,
    recordNodes: nodes,
    nodeDefs,
  });
  // iterate ober the nodes
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
  yield call(validateNode, {node, record, nodes, nodeDefs});
  yield call(updateDependantNodes);

  return; // { nodesModified[node, errors, warnings] }
}

function* updateNodeAndDependats({payload}) {
  const {node: currentNode, modification, recordNodes, record} = payload;

  // IF root validate within other root nodes in other survey Record // maybe this should go in other function
  yield call(validateIfRoot);

  // getNode
  // computeModifications
  yield call(validateNode);
  // getDependantNodes
  yield call(updateDependantNodes);
  // return { nodesModified, errors, warnings } // { nodesModified[node, errors, warnings] }
}

function* handleUpdateNode({payload}) {
  const {node: currentNode, modification} = payload;
  //getRecord
  //getNode
  const [nodesModified] = yield call(updateNodeAndDependats);
  //persitModifiedNodesErrorsAndWarning
}

export default handleUpdateNode;

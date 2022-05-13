import {RecordNodesUpdater, Objects} from '@openforis/arena-core';

export const updateNodeAndDependats = ({node, record: _record, survey}) => {
  const record = {
    ..._record,
    nodes: {..._record.nodes, [node.uuid]: {...node}},
  };

  const {record: recordUpdatedDependents, nodes: updatedNodes} =
    RecordNodesUpdater.updateNodesDependents({
      survey,
      record,
      nodes: [],
    });

  console.log(
    'recordUpdatedDependents',
    JSON.stringify(recordUpdatedDependents),
  );
  /*

  //recordWithUpdatedNode

  let validation = {
    warnings: {},
    errors: {},
  };

  const nodeValidation = validateNode({
    node,
    record,
    survey,
  });

  const {updatedNodes, validation: dependantsValidation} = updateDependantNodes(
    {
      node,
      record,
      survey,
    },
  );

  validation = _mergeValidations([
    validation,
    nodeValidation,
    dependantsValidation,
  ]);*/

  const validation = {};
  // validation shoudl happens after the update

  return {
    updatedNodes: Objects.deepMerge(
      {[node.uuid]: {...node}},
      updatedNodes || {},
    ),
    validation,
  };
};

import {
  RecordNodesUpdater,
  RecordValidator,
  Objects,
} from '@openforis/arena-core';

export const updateNodeAndDependants = async ({
  node,
  record: _record,
  survey,
}) => {
  const nodesUpdated = {[node.uuid]: {...node}};

  const record = {
    ..._record,
    nodes: Objects.deepMerge({}, _record.nodes || {}, nodesUpdated),
  };

  const updateRecord = RecordNodesUpdater.updateNodesDependents({
    survey,
    record,
    nodes: nodesUpdated,
  });

  const recordToValidate = Objects.deepMerge(record, updateRecord);

  const validation = await RecordValidator.validateNodes({
    survey,
    record: recordToValidate.record,
    nodes: recordToValidate.nodes,
  });

  const {nodes: updatedNodes} = recordToValidate;

  return {
    updatedNodes,
    validation,
  };
};

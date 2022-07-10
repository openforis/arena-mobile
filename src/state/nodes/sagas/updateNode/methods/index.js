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

  const {nodes: updatedNodes, record: updatedRecord} =
    RecordNodesUpdater.updateNodesDependents({
      survey,
      record,
      nodes: nodesUpdated,
    });

  const validation = await RecordValidator.validateNodes({
    survey,
    record: updatedRecord,
    nodes: updatedNodes,
  });

  return {
    updatedNodes,
    validation,
    record: updatedRecord,
  };
};

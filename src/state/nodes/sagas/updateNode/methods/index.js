import {RecordUpdater, Records} from '@openforis/arena-core';

export const updateNodeAndDependants = async ({
  node,
  record: _record,
  survey,
}) => {
  const recordUpdated = Records.addNode(node)(_record);

  const updateResult = await RecordUpdater.updateNode({
    survey,
    record: recordUpdated,
    node,
  });

  const validation = updateResult.validation;

  console.log(JSON.stringify(updateResult, null, 2));
  return {
    updatedNodes: updateResult.nodes,
    validation,
    record: updateResult.record,
  };
};

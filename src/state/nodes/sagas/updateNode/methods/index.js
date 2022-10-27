import {RecordUpdater} from '@openforis/arena-core';

export const updateNodeAndDependants = async ({survey, record, node}) => {
  const updateResult = await RecordUpdater.updateNode({
    survey,
    record,
    node,
  });
  return updateResult;
};

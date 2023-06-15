import {RecordUpdater} from '@openforis/arena-core';

export {default as callbackAndJump} from './callbackAndJump';
export {default as getNextNodeDefUuid} from './getNextNodeDefUuid';

export const updateNodeAndDependants = async ({survey, record, node}) => {
  const updateResult = await RecordUpdater.updateNode({
    survey,
    record,
    node,
  });
  return updateResult;
};

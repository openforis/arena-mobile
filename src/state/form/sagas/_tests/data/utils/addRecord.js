import globalInitialState from 'state/initial.state';

import mockRecord from '../mocks/record';

import getCurrentUuid from './getCurrentUuid';

const addRecord = (_, _prevState = {}) => {
  return {
    ..._prevState,
    form: {
      ...globalInitialState.form,
      data: {
        ...globalInitialState.form.data,
        record: getCurrentUuid(1),
      },
    },
    records: {
      ..._prevState.records,
      data: {
        ..._prevState.records.data,
        [getCurrentUuid(1)]: {...mockRecord},
      },
    },
    nodes: {
      ..._prevState.nodes,
    },
  };
};

export default addRecord;

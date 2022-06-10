import surveyDefinitions from '../mocks/surveyDefinitions';

import getCurrentUuid from './getCurrentUuid';

const addEntity = (
  {
    type = 'cluster',
    parentIndex,
    currentIndex,
    selectedNodeIndex,
    selectedNodeDefUuid,
  },
  _prevState = {},
) => {
  return {
    ..._prevState,
    form: {
      ..._prevState.form,
      data: {
        ..._prevState.form.data,
        parentEntityNode: getCurrentUuid(selectedNodeIndex || currentIndex),
        parentEntityNodeDef:
          selectedNodeDefUuid ||
          surveyDefinitions[type].nodeDefs[`${type.toUpperCase()}_UUID`].uuid,
        node: null, //getCurrentUuid(selectedNodeIndex || currentIndex),
        nodeDef: null, //selectedNodeDefUuid || surveyDefinitions[type].nodeDefs[`${type.toUpperCase()}_UUID`].uuid,
        //parentNode: parentIndex ? getCurrentUuid(parentIndex) : null,
      },
    },
    nodes: {
      ..._prevState.nodes,
      data: {
        ..._prevState.nodes.data,
        ...surveyDefinitions[type].new({
          parentIndex,
          currentIndex,
          prevState: _prevState,
        }),
      },
    },
  };
};

export default addEntity;

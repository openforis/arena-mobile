import surveyDefinitions from '../mocks/surveyDefinitions';

import getCurrentUuid from './getCurrentUuid';

const selectNode = (
  {
    type = 'cluster',
    nodeIndex,
    selectedNodeDefUuid,
    showMultipleEntityHome = false,
  },
  _prevState = {},
) => {
  return {
    ..._prevState,
    form: {
      ..._prevState.form,
      ui: {
        ..._prevState.form.ui,
        showMultipleEntityHome,
      },
      data: {
        ..._prevState.form.data,
        parentEntityNode: nodeIndex ? getCurrentUuid(nodeIndex) : false,
        parentEntityNodeDef:
          selectedNodeDefUuid ||
          surveyDefinitions[type].nodeDefs[`${type.toUpperCase()}_UUID`].uuid,
      },
    },
  };
};

export default selectNode;

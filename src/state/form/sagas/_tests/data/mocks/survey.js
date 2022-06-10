import clusterNodeDefs from './surveyDefinitions/cluster/nodeDefs';
import plotNodeDefs from './surveyDefinitions/plot/nodeDefs';
import treeNodeDefs from './surveyDefinitions/tree/nodeDefs';

const survey = {
  id: 'ID',

  uuid: 'SURVEY_UUID',
  props: {
    languages: ['LANG'],
  },
  nodeDefs: {
    ...clusterNodeDefs,
    ...plotNodeDefs,
    ...treeNodeDefs,
  },
};

export default survey;

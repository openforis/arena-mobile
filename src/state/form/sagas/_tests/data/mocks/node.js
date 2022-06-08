import moment from 'moment';

import getCurrentUuid from '../utils/getCurrentUuid';

import mockDate from './date';
import mockSurvey from './survey';

const node = ({index, parentNode, nodeDefUuid, value}) => ({
  uuid: getCurrentUuid(index) || getCurrentUuid(1),
  dateCreated: moment(mockDate).toISOString(),
  dateModified: moment(mockDate).toISOString(),
  surveyUuid: mockSurvey.uuid,
  recordUuid: getCurrentUuid(1),
  parentUuid: parentNode?.uuid,
  value: value || null,
  nodeDefUuid,
  meta: {
    h: parentNode ? [...(parentNode?.meta?.h || []), parentNode?.uuid] : [],
  },
  refData: null,
});

export default node;

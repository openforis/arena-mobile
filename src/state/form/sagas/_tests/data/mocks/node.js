import moment from 'moment';

import getCurrentUuid from '../utils/getCurrentUuid';

import mockDate from './date';
import mockSurvey from './survey';

const node = ({index, parentNode, nodeDefUuid, value}) => ({
  created: true,
  uuid: getCurrentUuid(index) || getCurrentUuid(1),
  dateCreated: moment().toISOString(),
  dateModified: moment(mockDate).format('yyyy-MM-DD_HH-mm-ss'),
  surveyUuid: mockSurvey.uuid,
  recordUuid: getCurrentUuid(1),
  parentUuid: parentNode?.uuid,
  value: value || undefined,
  nodeDefUuid,
  meta: {
    h: parentNode ? [...(parentNode?.meta?.h || []), parentNode?.uuid] : [],
  },
});

export default node;

import moment from 'moment';

import getCurrentUuid from '../utils/getCurrentUuid';

import mockSurvey from './survey';

const node = ({index, parentNode, nodeDefUuid, value}) => ({
  uuid: getCurrentUuid(index) || getCurrentUuid(1),
  dateCreated: moment().toISOString(),
  dateModified: moment().toISOString(),
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

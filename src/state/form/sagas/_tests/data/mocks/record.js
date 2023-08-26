import moment from 'moment';

import getCurrentUuid from '../utils/getCurrentUuid';

import mockDate from './date';
import mockSurvey from './survey';
import mockUser from './user';

let record = {
  uuid: getCurrentUuid(1),
  ownerUuid: mockUser.uuid,
  surveyUuid: mockSurvey.uuid,
  surveyId: mockSurvey.id,
  dateCreated: moment(mockDate).toISOString(),
  dateModified: moment(mockDate).toISOString(),
  step: '1',
  cycle: '0',
  ownerName: undefined,
  preview: false,
};

export default record;

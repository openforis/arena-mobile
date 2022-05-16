import moment from 'moment';

import globalInitialState from 'state/initial.state';

import _getCurrentUuid from './getCurrentUuid';

export const getCurrentUuid = _getCurrentUuid;

export const error = new Error('error');

export const mockUser = {
  uuid: 'USER_UUID',
};

export const mockSurvey = {
  id: 'ID',
  info: {
    id: 'ID',
    uuid: 'SURVEY_UUID',
    props: {
      languages: ['LANG'],
    },
  },
  nodeDefs: {
    NODE_DEF_UUID: {
      id: 'NODE_DEF_ID',
      uuid: 'NODE_DEF_UUID',
      propsAdvanced: {
        validations: {
          expressions: [
            {
              uuid: '1285f356-c0e2-4219-9c88-97c68f63fac7',
              applyIf: '',
              messages: {},
              severity: 'error',
              expression: 'this_number > 0',
            },
          ],
        },
      },
      props: {
        name: 'this_number',
        cycles: ['0'],
        labels: {
          en: 'This Number',
        },
      },
    },
  },
};

export const mockRecord = {
  uuid: getCurrentUuid(),
  ownerUuid: mockUser.uuid,
  dateCreated: moment().toISOString(),
  surveyUuid: mockSurvey.info.uuid,
  surveyId: mockSurvey.info.id,
  step: '1', // get from survey
  cycle: '0', // get from survey
};

export const baseMockNode = {
  uuid: getCurrentUuid(),
  dateCreated: moment().toISOString(),
  dateModified: moment().toISOString(),
  surveyUuid: mockSurvey.info.uuid,
  surveyId: mockSurvey.info.id,
  recordUuid: mockRecord?.uuid,
  nodeDefUuid: mockSurvey?.nodeDefs?.NODE_DEF_UUID?.uuid,
  parentUuid: null,
  value: null,
  meta: {},
  refData: null,
};
export const initialState = {
  ...globalInitialState,
  surveys: {
    ...globalInitialState.surveys,
    data: {
      [mockSurvey.info.uuid]: {...mockSurvey},
    },
  },
};

export const initialStateWithNodesAndRecords = {
  ...initialState,
  records: {
    ...globalInitialState.records,
    data: {
      ...globalInitialState.records.data,
      RECORD_ONE_UUID: {
        uuid: 'RECORD_ONE_UUID',
        surveyUuid: mockSurvey.info.uuid,
      },
    },
  },
  nodes: {
    ...globalInitialState.nodes,
    data: {
      ...globalInitialState.nodes.data,
      NODE_ONE_UUID: {uuid: 'NODE_ONE_UUID', surveyUuid: mockSurvey.info.uuid},
    },
  },
  survey: {
    ...globalInitialState.survey,
    data: {
      ...globalInitialState.survey.data,
      ...mockSurvey,
    },
  },
};

export const mockDate = '2021-05-01T10:11:12.000Z';

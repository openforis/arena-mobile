import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import recordsSelectors from 'state/records/selectors';

import {getSurvey} from './base';

export const getRecords = createCachedSelector(
  getSurvey,
  recordsSelectors.getRecords,
  (survey, records) =>
    records.filter(record => record.surveyUuid === survey?.uuid),
)(state => state?.survey?.data?.id || '_');

export const getNumberRecords = createSelector(
  getRecords,
  records => (records || []).length,
);

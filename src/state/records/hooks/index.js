import {Objects} from '@openforis/arena-core';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getRecordsFiles, getRecord} from 'state/__persistence';
import {selectors as recordsSelectors} from 'state/records';
import {selectors as surveySelectors} from 'state/survey';

const getRecordSummary = record => {
  const keysWhitelist = [
    'uuid',
    'recordKey',
    'dateCreated',
    'dateModified',
    'surveyUuid',
    'cycle',
  ];

  const recordSummary = {};
  keysWhitelist.forEach(key => {
    recordSummary[key] = record[key];
  });

  return recordSummary;
};

export const useRecordByUuid = recordUuid => {
  const [recordSummary, setRecordSummary] = useState({});
  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const record = useSelector(state =>
    recordsSelectors.getRecordByUuid(state, recordUuid),
  );

  const getRecordByUuidFromFs = useCallback(async () => {
    if (surveyUuid && cycle) {
      let _recordSummary = {};

      if (record === false || Objects.isEmpty(record)) {
        const _record = await getRecord({
          surveyUuid,
          cycle,
          uuid: recordUuid,
        });

        _recordSummary = getRecordSummary(_record);
      } else {
        _recordSummary = getRecordSummary(record);
      }

      setRecordSummary(_recordSummary);
    }
  }, [record, surveyUuid, cycle, setRecordSummary, recordUuid]);

  useEffect(() => {
    getRecordByUuidFromFs();
  }, [getRecordByUuidFromFs]);

  return recordSummary;
};

export const useNumberRecords = () => {
  const recordsUuids = useRecordsUuids();
  return recordsUuids.length;
};

export const useRecordsUuids = () => {
  const [recordsUuids, setRecordsUuids] = useState([]);
  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const records = useSelector(surveySelectors.getRecords);

  const getRecordsUuids = useCallback(async () => {
    if (surveyUuid && cycle) {
      const recordsFiles = await getRecordsFiles({
        surveyUuid,
        cycle,
      });

      const _recordsUuids = (recordsFiles || []).map(
        recordFile => recordFile.name.split('.json')[0],
      );

      records.forEach(_record => {
        if (_recordsUuids.indexOf(_record.uuid) < 0) {
          _recordsUuids.push(_record.uuid);
        }
      });

      setRecordsUuids(_recordsUuids);
    }
  }, [setRecordsUuids, surveyUuid, cycle, records]);

  useEffect(() => {
    getRecordsUuids();
  }, [getRecordsUuids]);

  useFocusEffect(
    useCallback(() => {
      getRecordsUuids?.();
    }, [getRecordsUuids]),
  );

  return recordsUuids;
};

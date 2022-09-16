import {Objects} from '@openforis/arena-core';
import moment from 'moment-timezone';
import {useCallback, useState, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import * as fs from 'infra/fs';
import {getRecordsFiles} from 'state/__persistence';
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

  let recordSummary = {};
  keysWhitelist.forEach(key => {
    recordSummary[key] = record[key];
  });

  return recordSummary;
};

const useRecordsByUuid = () => {
  const [recordsByUuid, setRecordsByUuid] = useState({});
  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const records = useSelector(surveySelectors.getRecords);

  const getRecordsFromFs = useCallback(async () => {
    if (surveyUuid && cycle) {
      const recordsFiles = await getRecordsFiles({
        surveyUuid,
        cycle,
      });

      let _recordsByUuid = {};

      await Promise.all(
        (recordsFiles || []).map(async recordFile => {
          const recordFileContent = await fs.readfile({
            filePath: recordFile.path,
          });
          if (Objects.isEmpty(recordFileContent)) {
            return;
          }
          const recordParsed = JSON.parse(recordFileContent);
          const recordSummary = getRecordSummary(recordParsed);
          _recordsByUuid[recordSummary.uuid] = recordSummary;
        }),
      );

      records.forEach(_record => {
        const recordSummary = getRecordSummary(_record);
        _recordsByUuid[_record.uuid] = recordSummary;
      });

      setRecordsByUuid(_recordsByUuid);
    }
  }, [setRecordsByUuid, surveyUuid, cycle, records]);

  useEffect(() => {
    getRecordsFromFs();
  }, [getRecordsFromFs]);

  return recordsByUuid;
};

export const useNumberRecords = () => {
  const [numberRecords, setNumberRecords] = useState(0);
  const recordsByUuid = useRecordsByUuid();
  useEffect(() => {
    setNumberRecords(Object.keys(recordsByUuid).length);
  }, [recordsByUuid]);
  return numberRecords;
};

export const useRecords = () => {
  const recordsByUuid = useRecordsByUuid();
  const records = useMemo(() => {
    return Object.values(recordsByUuid).sort((recordA, recordB) =>
      moment(recordA.dateCreated) > moment(recordB.dateCreated) ? -1 : 1,
    );
  }, [recordsByUuid]);
  return records;
};

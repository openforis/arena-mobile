import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {getRecordSummary} from 'arena/record';
import {Objects} from 'infra/objectUtils';
import {
  getRecordsFiles,
  getRecord,
  getRecordsSummary,
  persistRecordsSummary,
} from 'state/__persistence';
import {selectors as surveySelectors} from 'state/survey';

export const useRecordsSummary = () => {
  const recordsUuids = useRecordsUuids();
  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const recordsInSurvey = useSelector(surveySelectors.getRecords);
  const [summary, setSummary] = useState();

  const getSummary = useCallback(async () => {
    if (surveyUuid && cycle) {
      const _summary = await getRecordsSummary({
        surveyUuid,
        cycle,
      });

      const recordsUuidsToDelete = Object.keys(_summary);

      for (const recordUuid of recordsUuids) {
        if (Objects.isEmpty(_summary[recordUuid])) {
          const _record = await getRecord({
            surveyUuid,
            cycle,
            uuid: recordUuid,
          });

          const _recordSummary = getRecordSummary(_record);

          _summary[recordUuid] = _recordSummary;
        }
        const recordUuidIndex = recordsUuidsToDelete.indexOf(recordUuid);
        if (recordUuidIndex >= 0) {
          recordsUuidsToDelete.splice(recordUuidIndex, 1);
        }
      }

      for (const record of recordsInSurvey) {
        const _recordSummary = getRecordSummary(record);
        if (Objects.isEmpty(_summary[record.uuid])) {
          _summary[record.uuid] = _recordSummary;
        }
      }

      for (const uuid of recordsUuidsToDelete) {
        delete _summary[uuid];
      }

      if (!Objects.isEmpty(_summary)) {
        await persistRecordsSummary({summary: _summary, surveyUuid, cycle});
      }
      setSummary(_summary);
    }
  }, [recordsInSurvey, recordsUuids, surveyUuid, cycle]);

  useFocusEffect(
    useCallback(() => {
      getSummary?.();
    }, [getSummary]),
  );

  return summary;
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

  useFocusEffect(
    useCallback(() => {
      getRecordsUuids?.();
    }, [getRecordsUuids]),
  );

  return recordsUuids;
};

export const useRecordsUuidsSorted = records => {
  const recordsUuidsSorted = useMemo(() => {
    if (Objects.isEmpty(records)) {
      return [];
    }

    return Object.keys(records).sort((ka, kb) =>
      records[ka].dateCreated < records[kb].dateCreated ? 1 : -1,
    );
  }, [records]);

  return recordsUuidsSorted;
};

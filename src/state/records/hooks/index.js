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

  const [debugLog, setDebugLog] = useState('');

  const getSummary = useCallback(async () => {
    let _log = `useRecordsSummary
    getSummary`;

    try {
      _log = `${_log}
      **************************************
      _surveyUuid: ${surveyUuid}
      _cycle: ${cycle}
      **************************************
      `;

      if (surveyUuid && cycle) {
        const _summary = await getRecordsSummary({
          surveyUuid,
          cycle,
        });
        _log = `${_log}
        01.Summary (${Object.keys(_summary).length}):  
        ${JSON.stringify(_summary, null, 2)}`;

        const recordsUuidsToDelete = Object.keys(_summary);

        _log = `${_log}
02.recordsUuids
        ${JSON.stringify(recordsUuids, null, 2)}`;

        for (const recordUuid of recordsUuids) {
          if (Objects.isEmpty(_summary[recordUuid])) {
            _log = `${_log}
            Record ${recordUuid} not in summary`;

            const _record = await getRecord({
              surveyUuid,
              cycle,
              uuid: recordUuid,
            });

            const _recordSummary = getRecordSummary(_record);

            _log = `${_log}
            Record ${recordUuid} summary: ${JSON.stringify(_recordSummary, null, 2)}`;

            _summary[recordUuid] = _recordSummary;
          } else {
            _log = `${_log}
            Record ${recordUuid} already in summary`;
          }
          const recordUuidIndex = recordsUuidsToDelete.indexOf(recordUuid);
          if (recordUuidIndex >= 0) {
            recordsUuidsToDelete.splice(recordUuidIndex, 1);
          }
        }

        _log = `${_log}
03.recordsInSurvey (In memory) (${recordsInSurvey.length})
        ${JSON.stringify(
          recordsInSurvey.map(record => ({
            preview: record.preview,
            uuid: record.uuid,
            dateCreated: record.dateCreated,
            cycle: record.cycle,
            appInfo: record.appInfo,
          })),
          null,
          2,
        )}`;

        for (const record of recordsInSurvey) {
          const _recordSummary = getRecordSummary(record);

          _log = `${_log}
04.recordSummary
        ${JSON.stringify(_recordSummary, null, 2)}`;

          if (Objects.isEmpty(_summary[record.uuid])) {
            _log = `${_log}
            Record ${record.uuid} not in summary`;

            _summary[record.uuid] = _recordSummary;
          } else {
            _log = `${_log}
            Record ${record.uuid} already in summary`;
          }
        }

        _log = `${_log}
05.recordsUuidsToDelete
        ${JSON.stringify(recordsUuidsToDelete, null, 2)}`;
        for (const uuid of recordsUuidsToDelete) {
          delete _summary[uuid];
        }

        _log = `${_log}
06.newSummaryToPersist
        ${JSON.stringify(_summary, null, 2)}`;
        if (!Objects.isEmpty(_summary)) {
          await persistRecordsSummary({summary: _summary, surveyUuid, cycle});
        }
        setSummary(_summary);
      }
    } catch (error) {
      _log = `useRecordsSummary: getSummary: error: ${error}`;
    } finally {
      setDebugLog(_log);
    }
  }, [recordsInSurvey, recordsUuids, surveyUuid, cycle]);

  useFocusEffect(
    useCallback(() => {
      getSummary?.();
    }, [getSummary]),
  );

  return [summary, debugLog];
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

import { useCallback, useEffect, useState } from "react";

import { DateFormats, Dates } from "@openforis/arena-core";

import { useNavigationIsFocused } from "hooks";
import { RecordService } from "service";
import { SurveySelectors } from "state";
import { log } from "utils";

export type RecordsSummary = {
  lastModified: string | null;
  notUploadedCount: number;
  records: any[];
  totalCount: number;
  withErrorsCount: number;
};

const emptySummary: RecordsSummary = {
  lastModified: null,
  notUploadedCount: 0,
  records: [],
  totalCount: 0,
  withErrorsCount: 0,
};

const formatDateTime = (date: any) =>
  typeof date === "string"
    ? Dates.convertDate({
        dateStr: date,
        formatFrom: DateFormats.datetimeStorage,
        formatTo: DateFormats.datetimeDisplay,
      })
    : Dates.format(date, DateFormats.datetimeDisplay);

// local approximation (no server call): never synced or modified after the last sync
const isNotUploaded = (record: any) =>
  !record.dateSynced || Dates.isAfter(record.dateModified, record.dateSynced);

const hasErrors = (record: any) => (record.validation?.counts?.errors ?? 0) > 0;

const summarize = (records: any[]): RecordsSummary => {
  // records are sorted by date modified (desc)
  const lastDateModified = records[0]?.dateModified;
  return {
    lastModified: lastDateModified
      ? (formatDateTime(lastDateModified) ?? null)
      : null,
    notUploadedCount: records.filter(isNotUploaded).length,
    records,
    totalCount: records.length,
    withErrorsCount: records.filter(hasErrors).length,
  };
};

export const useRecordsSummary = () => {
  const isFocused = useNavigationIsFocused();
  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const [summary, setSummary] = useState(emptySummary);

  const fetchSummary = useCallback(async () => {
    if (!survey) return emptySummary;
    const records = await RecordService.fetchRecords({ survey, cycle });
    return summarize(records);
  }, [cycle, survey]);

  const reload = useCallback(async () => {
    try {
      setSummary(await fetchSummary());
    } catch (error) {
      log.error(`Failed to load records summary: ${error}`);
    }
  }, [fetchSummary]);

  useEffect(() => {
    if (!isFocused) return;
    let cancelled = false;
    fetchSummary()
      .then((summaryNext) => {
        if (!cancelled) setSummary(summaryNext);
      })
      .catch((error) => {
        log.error(`Failed to load records summary: ${error}`);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchSummary, isFocused]);

  return { ...summary, reload };
};

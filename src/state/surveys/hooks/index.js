import moment from 'moment';
import {useState, useCallback, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';

import apiSurveys from '../api';

export const useRemoteSurveys = ({prefetch = true} = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const serverUrl = useSelector(appSelectors.getServerUrl);

  const fetchSurveys = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const _surveys = await apiSurveys.getSurveys({serverUrl});
      setSurveys(
        _surveys.sort(
          (sa, sb) => -moment(sa.dateModified).diff(moment(sb.dateModified)),
        ),
      );
    } catch (e) {
      setSurveys([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    if (prefetch) {
      fetchSurveys();
    }
  }, [fetchSurveys, prefetch]);

  return {loading, error, surveys, fetchSurveys};
};

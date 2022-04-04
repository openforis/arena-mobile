import {useState, useCallback, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {selectors as appSelectors} from 'state/app';

import apiSurveys from '../api';

export const useRemoteSurveys = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const serverUrl = useSelector(appSelectors.getServerUrl);

  const fetchSurveys = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const _surveys = await apiSurveys.getSurveys({serverUrl});
      setSurveys(_surveys);
    } catch (e) {
      console.log('error', e);
      setSurveys([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {loading, error, surveys, fetchSurveys};
};

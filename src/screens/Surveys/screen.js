import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import Layout from 'arena-mobile-ui/components/Layout';
import {selectors as surveySelectors} from 'state/survey';

const Surveys = () => {
  const localSurvey = useSelector(surveySelectors.getSurvey);
  const [surveysOrigin] = useState('local');
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    if (localSurvey?.info?.id) {
      setSelectedSurvey(localSurvey);
      return;
    }
    setSelectedSurvey(null);
  }, [localSurvey, surveysOrigin]);

  return (
    <Layout bottomStyle={selectedSurvey ? 'primary' : 'white'}>
      <></>
    </Layout>
  );
};

export default Surveys;

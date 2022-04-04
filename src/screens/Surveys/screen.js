import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveySelectors} from 'state/survey';

import SurveyOriginSelector from './components/SurveyOriginSelector';

const Surveys = () => {
  const localSurvey = useSelector(surveySelectors.getSurvey);
  const [surveysOrigin, setSurveysOrigin] = useState('local');
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
      <>
        <Header
          hasBackComponent={true}
          RightComponent={
            <SurveyOriginSelector
              setSurveysOrigin={setSurveysOrigin}
              surveysOrigin={surveysOrigin}
            />
          }>
          <Text style={[baseStyles.textStyle.title]}>Surveys</Text>
        </Header>
      </>
    </Layout>
  );
};

export default Surveys;

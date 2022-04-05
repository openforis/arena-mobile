import React, {useCallback, useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveySelectors} from 'state/survey';

import Local from './components/Local';
import Remote from './components/Remote';
import SelectedSurveyPanel from './components/SelectedSurveyPanel';
import SurveyOriginSelector from './components/SurveyOriginSelector';
import styles from './styles';

const Surveys = () => {
  const localSurvey = useSelector(surveySelectors.getSurvey);
  const [surveysOrigin, setSurveysOrigin] = useState('local');
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const resetSelectedSurvey = useCallback(() => {
    setSelectedSurvey(null);
  }, []);

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

        <View style={[styles.listContainer]}>
          {surveysOrigin === 'local' ? (
            <Local
              setSurveysOrigin={setSurveysOrigin}
              selectedSurvey={selectedSurvey}
              setSelectedSurvey={setSelectedSurvey}
            />
          ) : (
            <Remote
              setSurveysOrigin={setSurveysOrigin}
              selectedSurvey={selectedSurvey}
              setSelectedSurvey={setSelectedSurvey}
            />
          )}
        </View>
        {selectedSurvey && (
          <SelectedSurveyPanel
            survey={selectedSurvey}
            unSelect={resetSelectedSurvey}
            surveysOrigin={surveysOrigin}
          />
        )}
      </>
    </Layout>
  );
};

export default Surveys;

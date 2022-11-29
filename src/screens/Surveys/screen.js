import React, {useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import surveysSector from 'state/surveys/selectors';

import Local from './components/Local';
import Remote from './components/Remote';
import SelectedSurveyPanel from './components/SelectedSurveyPanel';
import Sorter from './components/Sorter';
import {SORTERS} from './components/Sorter/config';
import SurveyOriginSelector from './components/SurveyOriginSelector';
import styles from './styles';

const Surveys = () => {
  const numberOfSurveys = useSelector(surveysSector.getNumberOfLocalSurveys);

  const [surveysOrigin, setSurveysOrigin] = useState('local');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [sortCriteriaIndex, setSortCriteriaIndex] = useState(0);

  const resetSelectedSurvey = useCallback(() => {
    setSelectedSurvey(null);
  }, []);

  useEffect(() => {
    resetSelectedSurvey();
  }, [resetSelectedSurvey, surveysOrigin]);

  useEffect(() => {
    if (numberOfSurveys <= 0) {
      setSurveysOrigin('remote');
    }
  }, [numberOfSurveys]);

  return (
    <Layout bottomStyle={selectedSurvey ? 'primary' : 'background'}>
      <>
        <Header
          hasBackComponent={true}
          RightComponent={
            <Sorter
              setSortCriteriaIndex={setSortCriteriaIndex}
              sortCriteriaIndex={sortCriteriaIndex}
            />
          }
        />
        <SurveyOriginSelector
          setSurveysOrigin={setSurveysOrigin}
          surveysOrigin={surveysOrigin}
        />
        <View style={[styles.listContainer]}>
          {surveysOrigin === 'local' ? (
            <Local
              sortCriteria={SORTERS[sortCriteriaIndex]}
              setSurveysOrigin={setSurveysOrigin}
              selectedSurvey={selectedSurvey}
              setSelectedSurvey={setSelectedSurvey}
            />
          ) : (
            <Remote
              sortCriteria={SORTERS[sortCriteriaIndex]}
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

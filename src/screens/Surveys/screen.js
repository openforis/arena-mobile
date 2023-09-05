import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import Header from 'arena-mobile-ui/components/Header';
import Layout from 'arena-mobile-ui/components/Layout';
import NotLoggedIn from 'arena-mobile-ui/components/NotLoggedIn';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import surveysSector from 'state/surveys/selectors';
import userSelectors from 'state/user/selectors';

import SelectedSurveyPanel from './components/SelectedSurveyPanel';
import SurveysList from './components/SurveysList';
import _styles from './styles';

const Surveys = () => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);
  const user = useSelector(userSelectors.getUser);

  const numberOfSurveys = useSelector(surveysSector.getNumberOfLocalSurveys);
  const [surveysOrigin, setSurveysOrigin] = useState('local');
  const [selectedSurvey, setSelectedSurvey] = useState(null);

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
    <Layout bottomSafeArea={false}>
      <>
        <Header hasBackComponent={true}>
          <TextTitle>{t(`Surveys:title.${surveysOrigin}`)}</TextTitle>
        </Header>
        {!user?.name && (
          <View style={styles.listContainer}>
            <NotLoggedIn />
          </View>
        )}

        {user?.name && (
          <>
            <View style={styles.listContainer}>
              <SurveysList
                surveysOrigin={surveysOrigin}
                setSurveysOrigin={setSurveysOrigin}
                selectedSurvey={selectedSurvey}
                setSelectedSurvey={setSelectedSurvey}
              />
            </View>
            {selectedSurvey && (
              <SelectedSurveyPanel
                survey={selectedSurvey}
                unSelect={resetSelectedSurvey}
                surveysOrigin={surveysOrigin}
              />
            )}
          </>
        )}
      </>
    </Layout>
  );
};

export default Surveys;

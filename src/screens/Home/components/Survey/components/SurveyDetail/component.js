import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import baseStyles from 'arena-mobile-ui/styles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const SurveyDetail = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const surveyLanguage = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();

  return (
    <Card customStyles={[styles.container]}>
      <Text style={baseStyles.textStyle.secondaryText}>
        {t('Home:survey.card.current_survey')}
      </Text>
      <Text style={baseStyles.textStyle.title}>
        {survey.info.props.labels[surveyLanguage]} ·{survey.info.props.name}{' '}
      </Text>
      <Text>
        {t('Home:survey.card.id')}: {survey.info.id}
      </Text>
      <Text>
        {t('Home:survey.card.language')}: {surveyLanguage}
      </Text>

      <View style={[styles.buttonContainer]}>
        <Button
          type="ghost"
          label={t('Home:survey.card.go_to_survey_details')}
          onPress={navigateTo({route: routes.SURVEY})}
        />
      </View>
      <View style={[styles.buttonContainer]}>
        <Button
          type="ghost"
          label={t('Home:survey.card.go_to_survey_details')}
          onPress={navigateTo({route: routes.RECORDS})}
        />
      </View>
    </Card>
  );
};

export default SurveyDetail;

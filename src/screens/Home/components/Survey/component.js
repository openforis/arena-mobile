import * as React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as surveysSelectors} from 'state/surveys';

import NoLocalSurveys from './components/NoLocalSurveys';
import NoSurveySelected from './components/NoSurveySelected';
import SurveyDetail from './components/SurveyDetail';

const Survey = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const numSurveys = useSelector(surveysSelectors.getNumberOfLocalSurveys);

  if (survey?.info?.id) {
    return (
      <>
        <SurveyDetail />

        <View style={{flex: 2, justifyContent: 'flex-end'}}>
          <Text style={baseStyles.textStyle.title}>title</Text>
          <Text style={baseStyles.textStyle.header}>header</Text>
          <Text style={baseStyles.textStyle.text}>text</Text>
          <Text style={baseStyles.textStyle.bold}>bold</Text>
          <Text style={baseStyles.textStyle.secondaryText}>bold</Text>
          <Text style={baseStyles.textStyle.bold} />
          <Text style={baseStyles.textStyle.bold}>{numSurveys}</Text>
          <Button label="aa" />
          <Button type="secondary" label="secondary" />
          <Button type="ghost" label="ghost" />
          <Button type="ghostBlack" label="ghostBlack" />
          <Button type="delete" label="delete" />
        </View>
      </>
    );
  }

  if (numSurveys > 0) {
    return <NoSurveySelected />;
  }

  if (numSurveys <= 0) {
    return <NoLocalSurveys />;
  }
  return <></>;
};

export default Survey;

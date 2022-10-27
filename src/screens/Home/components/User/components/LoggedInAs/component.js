import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

import Card from 'arena-mobile-ui/components/Card';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as userSelectors} from 'state/user';

const LoggedInAs = () => {
  const {t} = useTranslation();

  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const name = useSelector(userSelectors.getName);
  const email = useSelector(userSelectors.getEmail);
  const role = useSelector(state => userSelectors.getRole(state, surveyUuid));

  return (
    <Card>
      <Text style={[baseStyles.textStyle.secondaryText]}>
        {t('Home:logged_in_as')}
      </Text>
      <LabelsAndValues
        size="s"
        items={[
          {label: t('Home:username'), value: name},
          {label: t('Home:email'), value: email},
          {label: t('Home:role'), value: role},
        ]}
      />
    </Card>
  );
};

export default LoggedInAs;

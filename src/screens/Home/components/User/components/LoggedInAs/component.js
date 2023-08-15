import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import Card from 'arena-mobile-ui/components/Card';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
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
      <TextBase type="secondary">{t('Home:logged_in_as')}</TextBase>
      <LabelsAndValues
        size="s"
        items={[
          {label: t('Home:name'), value: name},
          {label: t('Home:email'), value: email},
          {label: t('Home:role'), value: t(`Home:roles.${role}.label`)},
        ]}
      />
    </Card>
  );
};

export default LoggedInAs;

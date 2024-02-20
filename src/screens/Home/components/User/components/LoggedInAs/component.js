import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {selectors as surveySelectors} from 'state/survey';
import {selectors as userSelectors} from 'state/user';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import _styles from './styles';

const LoggedInAs = () => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);

  const surveyUuid = useSelector(surveySelectors.getSelectedSurveyUuid);
  const name = useSelector(userSelectors.getName);
  const email = useSelector(userSelectors.getEmail);
  const role = useSelector(state => userSelectors.getRole(state, surveyUuid));

  return (
    <View style={styles.container}>
      <TextBase type="secondary" size="s">
        {t('Home:logged_in_as')}
      </TextBase>
      <TextBase type="bold">
        {name} ({email})
      </TextBase>
      <TextBase type="secondary">{t(`Home:roles.${role}.label`)}</TextBase>
    </View>
  );
};

export default LoggedInAs;

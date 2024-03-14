import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {alert} from 'arena-mobile-ui/utils';
import {actions as surveyActions} from 'state/survey';

import _styles from './styles';

const ShareDataButton = () => {
  const styles = useThemedStyles(_styles);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const shareData = useCallback(({allRecords = false}) => {
    dispatch(surveyActions.shareSurveyData({allRecords}));
  });

  const onPress = useCallback(() => {
    alert({
      title: t('Records:share_data.title'),
      message: t('Records:share_data.message'),
      acceptText: t('Records:share_data.only_updated_records'),
      onAccept: () => shareData({allRecords: false}),
      dismissText: t('Records:share_data.all_records'),
      onDismiss: () => shareData({allRecords: true}),
    });
  }, [shareData]);

  return (
    <Button
      onPress={onPress}
      type="neutral"
      customContainerStyle={styles.button}
      icon={<Icon name="share" color={styles.colors.secondaryContrastText} />}
    />
  );
};

export default ShareDataButton;

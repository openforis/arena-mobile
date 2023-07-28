import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as surveyActions} from 'state/survey';

import _styles from './styles';

const UploadDataButton = () => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();

  const dispatch = useDispatch();

  const handleUploadData = useCallback(() => {
    dispatch(surveyActions.uploadSurveyData());
  }, [dispatch]);

  return (
    <Button
      label={t('Records:subpanel.upload_data.label')}
      onPress={handleUploadData}
      type="primary"
      customContainerStyle={styles.button}
      customTextStyle={styles.buttonText}
      allowMultipleLines={true}
      iconPosition={'right'}
      icon={
        <Icon
          name="cloud-upload"
          size="m"
          color={styles.colors.primaryContrastText}
        />
      }
    />
  );
};

export default UploadDataButton;

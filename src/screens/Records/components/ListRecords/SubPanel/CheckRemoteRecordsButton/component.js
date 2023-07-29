import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as recordsActions} from 'state/records';

import _styles from './styles';

const CheckRemoteRecordsButton = () => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();

  const dispatch = useDispatch();

  const handleCheckRemoteRecords = useCallback(() => {
    dispatch(recordsActions.getRemoteRecordsSummary());
  }, [dispatch]);

  return (
    <Button
      label={t('Records:subpanel.check_remote_records_button.label')}
      onPress={handleCheckRemoteRecords}
      type="neutral"
      customContainerStyle={styles.button}
      customTextStyle={styles.buttonText}
      allowMultipleLines={true}
      iconPosition={'right'}
      icon={<Icon name="cloud-sync" size="m" />}
    />
  );
};

export default CheckRemoteRecordsButton;

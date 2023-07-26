import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {actions as recordsActions} from 'state/records';

import styles from './styles';

const FiltersAndSorters = () => {
  const {t} = useTranslation();

  const dispatch = useDispatch();

  const handleSyncRecords = useCallback(() => {
    dispatch(recordsActions.getRemoteRecordsSummary());
  }, [dispatch]);

  return (
    <Button
      label={t('Records:subpanel.sync_records_button.label')}
      onPress={handleSyncRecords}
      type="ghost"
      customContainerStyle={styles.button}
      allowMultipleLines={true}
    />
  );
};

export default FiltersAndSorters;

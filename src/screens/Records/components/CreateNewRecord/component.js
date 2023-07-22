import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';

import _styles from './styles';

const CreateNewRecord = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const handleInitializeRecord = useCallback(() => {
    dispatch(formActions.initializeRecord());
  }, [dispatch]);
  const styles = useThemedStyles(_styles);

  return (
    <Button
      onPress={handleInitializeRecord}
      label={t('Records:create_new_record')}
      customContainerStyle={styles.container}
    />
  );
};

export default CreateNewRecord;

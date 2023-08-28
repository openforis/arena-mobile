import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import SwitchComponent from 'arena-mobile-ui/components/Switch/component';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';
import {actions as recordsActions} from 'state/records';

import _styles from './styles';

const RecordLocked = () => {
  const [persist, setPersist] = useState(false);
  const isRecordLocked = useSelector(formSelectors.isRecordLocked);
  const recordUuid = useSelector(formSelectors.getRecordUuid);
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const styles = useThemedStyles(_styles);

  const handleUnlock = useCallback(() => {
    dispatch(recordsActions.unlockRecord({recordUuid}));
  }, [dispatch, recordUuid]);

  useEffect(() => {
    if (isRecordLocked) {
      setPersist(true);
    }
  }, [isRecordLocked]);

  if (!isRecordLocked || !persist) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SwitchComponent
        customContainerStyle={styles.lockedSwitch}
        value={isRecordLocked}
        onValueChange={handleUnlock}
        title={`${t('Form:record_locked')}, ${t('Form:unlock')}`}
      />
    </View>
  );
};

export default RecordLocked;

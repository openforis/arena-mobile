import moment from 'moment-timezone';
import React, {useEffect, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {useNumberRecords} from 'state/records/hooks';
import {selectors as userSelectors} from 'state/user';

import _styles from './styles';

const NUMBER_OF_DAYS_TO_CONTINUE_RECORD = 3;

const useHasRecordToContinue = () => {
  const [currentRecordUuid, setCurrentRecordUuid] = useState(null);
  const currentRecord = useSelector(formSelectors.getRecord);

  useEffect(() => {
    if (!currentRecord?.uuid) {
      setCurrentRecordUuid(null);
      return;
    }

    if (currentRecord?.dateModified) {
      if (
        moment().diff(moment(currentRecord?.dateModified), 'days') <=
        NUMBER_OF_DAYS_TO_CONTINUE_RECORD
      ) {
        setCurrentRecordUuid(currentRecord?.uuid);
      } else {
        setCurrentRecordUuid(null);
      }
    } else {
      setCurrentRecordUuid(currentRecord?.uuid);
    }
  }, [currentRecord]);

  return currentRecordUuid;
};

const Actions = () => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {navigateTo, routes} = useNavigateTo();
  const currentRecordUuid = useHasRecordToContinue();
  const numberOfRecords = useNumberRecords();
  const numberOfErrors = 0;
  const user = useSelector(userSelectors.getUser);

  const handleInitializeRecord = useCallback(() => {
    dispatch(formActions.initializeRecord());
  }, [dispatch]);

  if (!user?.name) {
    return null;
  }

  return (
    <View style={styles.container}>
      {numberOfRecords > 0 && (
        <Button
          type="secondary"
          label={t('Actions:records', {count: numberOfRecords})}
          onPress={navigateTo({route: routes.RECORDS})}
        />
      )}
      {numberOfErrors > 0 && (
        <Button
          type="secondary"
          label={t('Actions:validation_report', {count: numberOfErrors})}
        />
      )}
      {currentRecordUuid && (
        <Button
          type="secondary"
          label={t('Actions:new_record')}
          onPress={handleInitializeRecord}
        />
      )}
      <View style={styles.separator} />
      {currentRecordUuid ? (
        <Button
          type="primary"
          label={t('Actions:continue_record')}
          onPress={navigateTo({route: routes.FORM})}
        />
      ) : (
        <Button
          type="primary"
          label={t('Actions:new_record')}
          onPress={handleInitializeRecord}
        />
      )}
    </View>
  );
};

export default Actions;

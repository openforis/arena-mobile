import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';
const Actions = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {navigateTo, routes} = useNavigateTo();
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);
  const numberOfRecords = useSelector(surveySelectors.getNumberRecords);
  const numberOfErrors = 0;

  const handleInitializeRecord = React.useCallback(() => {
    dispatch(formActions.initializeRecord());
  }, [dispatch]);

  return (
    <View style={[styles.container]}>
      {numberOfRecords > 0 && (
        <Button
          type="secondary"
          label={t('Actions.records', {count: 100})}
          onPress={navigateTo({route: routes.RECORDS})}
        />
      )}
      {numberOfErrors > 0 && (
        <Button
          type="secondary"
          label={t('Actions.validation_report', {count: 100})}
        />
      )}
      {currentRecordUuid && (
        <Button
          type="secondary"
          label={t('Actions.new_record')}
          onPress={handleInitializeRecord}
        />
      )}
      <View style={[styles.separator]} />
      {currentRecordUuid ? (
        <Button
          type="primary"
          label={t('Actions.continue_record')}
          onPress={navigateTo({route: routes.FORM})}
        />
      ) : (
        <Button
          type="primary"
          label={t('Actions.new_record')}
          onPress={handleInitializeRecord}
        />
      )}
    </View>
  );
};

export default Actions;

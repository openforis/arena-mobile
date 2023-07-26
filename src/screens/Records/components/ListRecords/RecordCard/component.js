import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import formSelectors from 'state/form/selectors';
import recordsSelectors from 'state/records/selectors';

import _styles from './styles';

// SORT and FILTER
// airplane-alert
const ProgressBar = () => {
  return null;
};

const RecordCard = ({record, recordUuid, isSelected, onSelect}) => {
  const styles = useThemedStyles(_styles);
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);

  const isRecordsRemoteSummaryReady = useSelector(
    recordsSelectors.isRecordsRemoteSummaryReady,
  );

  const recordRemoteSummary = useSelector(state =>
    recordsSelectors.getRemoteRecordSummary(state, recordUuid),
  );

  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const {t} = useTranslation();

  const status = useMemo(() => {
    if (!recordRemoteSummary) {
      return {
        label: t('Records:status_not_in_server'),
        icon: 'cloud-alert',
        iconColor: 'red',
      };
    }

    if (recordRemoteSummary?.dateModified > record?.dateModified) {
      return {
        label: t('Records:status_modified_download'),
        icon: 'clock-alert-outline',
        iconColor: 'red',
      };
    }

    if (recordRemoteSummary?.dateModified < record?.dateModified) {
      return {
        label: t('Records:status_modified_upload'),
        icon: 'clock-alert-outline',
        iconColor: 'red',
      };
    }

    return {
      label: t('Records:status_synced'),
      icon: 'cloud-check-outline',
      iconColor: 'red',
    };
  }, [recordRemoteSummary, record, t]);

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View style={styles.payload}>
        <TextBase type="bold">
          {record.recordKey || t('Records:empty_key')}
        </TextBase>
        <CreatedAndModified
          dateCreated={record?.dateCreated}
          dateModified={record?.dateModified}
        />
      </View>
      {currentRecordUuid === recordUuid && (
        <CurrentItemLabel label={t('Records:current_record')} />
      )}
      {isRecordsRemoteSummaryReady && status && (
        <TextBase type="bold" style={styles.status}>
          {status.label}
          <Icon name={status.icon} size={20} />
        </TextBase>
      )}
      <ProgressBar />
    </TouchableCard>
  );
};

export default RecordCard;

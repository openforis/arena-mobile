import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import {getLocalRecordStatus, recordStatus} from 'arena/record';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import recordsSelectors from 'state/records/selectors';

import _styles from './styles';
const RecordStatus = ({record, recordUuid}) => {
  const styles = useThemedStyles(_styles);
  const recordRemoteSummary = useSelector(state =>
    recordsSelectors.getRemoteRecordSummary(state, recordUuid),
  );

  const {t} = useTranslation();

  const status = useMemo(() => {
    const _status = getLocalRecordStatus({record, recordRemoteSummary});

    if (_status === recordStatus.new) {
      return {
        label: t('Records:record_status.not_in_server'),
        icon: 'cloud-alert',
        color: 'alert',
        iconColor: styles.color.alert.color,
      };
    }

    if (_status === recordStatus.notInEntryStepAnymore) {
      return {
        label: t('Records:record_status.not_in_entry_step_anymore'),
        icon: 'cloud-alert',
        color: 'alert',
        iconColor: styles.color.alert.color,
      };
    }

    if (_status === recordStatus.modifiedRemotely) {
      return {
        label: t('Records:record_status.modified_download'),
        icon: 'clock-alert-outline',
        color: 'alert',
        iconColor: styles.color.alert.color,
      };
    }

    if (_status === recordStatus.modifiedLocally) {
      return {
        label: t('Records:record_status.modified_upload'),
        icon: 'clock-alert-outline',
        color: 'alert',
        iconColor: styles.color.alert.color,
      };
    }

    return {
      label: t('Records:record_status.checked'),
      icon: 'cloud-check-outline',
      color: 'success',
      iconColor: styles.color.success.color,
    };
  }, [recordRemoteSummary, record, t, styles]);

  const textCustomStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.text,
      status?.color ? styles.color[status.color] : {},
    );
  }, [status, styles]);

  if (!status) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Icon name={status.icon} size="s" color={status.iconColor} />
      <TextBase type="bolder" size="m" customStyle={textCustomStyle}>
        {status.label}
      </TextBase>
    </View>
  );
};
export default RecordStatus;

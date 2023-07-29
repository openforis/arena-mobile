import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {alert} from 'arena-mobile-ui/utils';
import {actions as formActions} from 'state/form';
import {actions as recordActions} from 'state/records';

import _styles from './styles';

const SelectedRecordPanel = ({record, unSelect}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const styles = useThemedStyles(_styles);

  const handleDelete = useCallback(() => {
    alert({
      title: t('Records:selected_record_panel.delete.alert.title'),
      message: t('Records:selected_record_panel.delete.alert.message', {
        name: record.recordKey || t('Records:empty_key'),
      }),
      acceptText: t('Records:selected_record_panel.delete.alert.accept'),
      dismissText: t('Records:selected_record_panel.delete.alert.dismiss'),
      onAccept: () => {
        dispatch(
          recordActions.deleteRecord({
            recordUuid: record?.uuid,
            callBack: unSelect,
          }),
        );
      },
      onDismiss: () => null,
    });
  }, [dispatch, record, unSelect, t]);

  const handleSelect = useCallback(() => {
    dispatch(formActions.continueRecord({record}));
  }, [dispatch, record]);

  return (
    <View style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <TouchableIcon iconName="close" onPress={unSelect} />
      </View>
      <Button
        type="primary"
        label={t('Records:selected_record_panel.cta_continue')}
        onPress={handleSelect}
      />
      <Button
        type="delete"
        label={t('Records:selected_record_panel.cta_delete')}
        onPress={handleDelete}
      />
    </View>
  );
};

export default SelectedRecordPanel;

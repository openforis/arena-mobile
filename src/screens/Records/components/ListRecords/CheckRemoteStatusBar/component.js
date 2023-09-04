import moment from 'moment';
import React, {useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import Icon from 'arena-mobile-ui/components/Icon';
import MessageBar from 'arena-mobile-ui/components/MessageBar/component';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';
import {
  selectors as recordSelectors,
  actions as recordsActions,
} from 'state/records';

import _styles from './styles';

const CheckRemoteStatusBar = () => {
  const remoteRecordsSummaryError = useSelector(
    recordSelectors.getIsGettingRemoteRecordsSummaryError,
  );
  const isReady = useSelector(recordSelectors.isRemoteRecordsSummaryReady);
  const lastCheck = useSelector(
    recordSelectors.getRemoteRecordsSummaryLastCheck,
  );

  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const styles = useThemedStyles(_styles);

  const dispatch = useDispatch();

  const handleCheckRemoteRecords = useCallback(() => {
    dispatch(recordsActions.getRemoteRecordsSummary());
  }, [dispatch]);

  const infoLabel = useMemo(() => {
    if (remoteRecordsSummaryError) {
      return t('Records:status_connection_bar.error.info');
    }
    if (!isReady) {
      return t('Records:status_connection_bar.info.info');
    }
    return t('Records:status_connection_bar.success.info', {
      serverUrl: currentServerUrl,
    });
  }, [remoteRecordsSummaryError, isReady, t, currentServerUrl]);

  const buttonConfig = useMemo(() => {
    if (!isReady) {
      return {
        label: t('Records:subpanel.check_remote_records_button.label'),
        onPress: handleCheckRemoteRecords,
        icon: <Icon name="cloud-sync" size="m" />,
        iconPosition: 'right',
      };
    }
    if (remoteRecordsSummaryError) {
      return {
        label: t('Records:status_connection_bar.error.cta_label'),
        onPress: navigateTo({
          route: routes.CONNECTION_SETTINGS,
          replace: true,
        }),
      };
    }
    return null;
  }, [
    isReady,
    remoteRecordsSummaryError,
    t,
    handleCheckRemoteRecords,
    navigateTo,
    routes,
  ]);

  return (
    <MessageBar
      label={
        <View>
          <TextBase customStyle={styles.text} size="s">
            {infoLabel}
          </TextBase>
          <TextBase customStyle={styles.text} size="s">
            {lastCheck &&
              `${t('Common:last_check')}: ${moment(lastCheck).format(
                'YYYY-MM-DD HH:mm',
              )}`}
          </TextBase>
        </View>
      }
      type={remoteRecordsSummaryError ? 'error' : !isReady ? 'info' : 'success'}
      buttonLabel={buttonConfig?.label}
      onPress={buttonConfig?.onPress}
      buttonIcon={buttonConfig?.icon}
      buttonIconPosition={buttonConfig?.iconPosition}
    />
  );
};

export default CheckRemoteStatusBar;

import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';
import {selectors as recordSelectors} from 'state/records';

import _styles from './styles';

const CheckRemoteStatusBar = () => {
  const remoteRecordsSummaryError = useSelector(
    recordSelectors.getIsGettingRemoteRecordsSummaryError,
  );
  const isReady = useSelector(recordSelectors.isRecordsRemoteSummaryReady);

  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const styles = useThemedStyles(_styles);

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

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(
        styles.container,
        remoteRecordsSummaryError && styles.containerWithError,
      ),

      !isReady && styles.containerWithInfo,
    );
  }, [remoteRecordsSummaryError, isReady, styles]);

  return (
    <View style={containerStyle}>
      <TextBase customStyle={styles.text} size="s">
        {infoLabel}
      </TextBase>
      {remoteRecordsSummaryError && (
        <Button
          label={t('Records:status_connection_bar.error.cta_label')}
          onPress={navigateTo({
            route: routes.CONNECTION_SETTINGS,
            replace: true,
          })}
          type="ghostBlack"
          customContainerStyle={styles.button}
          allowMultipleLines={true}
        />
      )}
    </View>
  );
};

CheckRemoteStatusBar.defaultProps = {
  remoteRecordsSummaryError: false,
  info: null,
};

export default CheckRemoteStatusBar;

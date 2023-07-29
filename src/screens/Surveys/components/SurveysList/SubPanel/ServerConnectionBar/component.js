import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';

import _styles from './styles';

const ServerConnectionBar = ({errorRemoteServer, info}) => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);
  const styles = useThemedStyles(_styles);

  const infoLabel = useMemo(() => {
    if (errorRemoteServer) {
      return t('Surveys:subpanel.server_connection_bar.error.info');
    }
    if (info) {
      return t('Surveys:subpanel.server_connection_bar.info.info');
    }
    return t('Surveys:subpanel.server_connection_bar.success.info', {
      serverUrl: currentServerUrl,
    });
  }, [errorRemoteServer, info, t, currentServerUrl]);

  return (
    <View
      style={[
        styles.container,
        errorRemoteServer && styles.containerWithError,
        info && styles.containerWithInfo,
      ]}>
      <TextBase customStyle={styles.text} size="s">
        {infoLabel}
      </TextBase>
      {errorRemoteServer && (
        <Button
          label={t('Surveys:subpanel.server_connection_bar.error.cta_label')}
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

ServerConnectionBar.defaultProps = {
  errorRemoteServer: false,
  info: null,
};

export default ServerConnectionBar;

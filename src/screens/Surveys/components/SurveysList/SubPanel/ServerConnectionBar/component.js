import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';

import styles from './styles';

const SubPanel = ({errorRemoteServer}) => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);

  return (
    <View
      style={[
        styles.container,
        errorRemoteServer && styles.containerWithError,
      ]}>
      <Text style={styles.text}>
        {errorRemoteServer
          ? t('Surveys:subpanel.server_connection_bar.error.info')
          : t('Surveys:subpanel.server_connection_bar.success.info', {
              serverUrl: currentServerUrl,
            })}
      </Text>
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

export default SubPanel;

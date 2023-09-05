import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import MessageBar from 'arena-mobile-ui/components/MessageBar';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';

const ServerConnectionBar = ({errorRemoteServer, info}) => {
  const {t} = useTranslation();
  const {navigateTo, routes} = useNavigateTo();
  const currentServerUrl = useSelector(appSelectors.getServerUrl);

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
    <MessageBar
      label={
        <TextBase size="s" allowMultipleLines={true}>
          {infoLabel}
        </TextBase>
      }
      type={errorRemoteServer ? 'error' : info ? 'info' : 'success'}
      buttonLabel={
        errorRemoteServer
          ? t('Surveys:subpanel.server_connection_bar.error.cta_label')
          : null
      }
      onPress={navigateTo({
        route: routes.CONNECTION_SETTINGS,
        replace: true,
      })}
    />
  );
};

ServerConnectionBar.defaultProps = {
  errorRemoteServer: false,
  info: null,
};

export default ServerConnectionBar;

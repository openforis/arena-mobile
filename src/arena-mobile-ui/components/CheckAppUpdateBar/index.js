import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking} from 'react-native';

import MessageBar from 'arena-mobile-ui/components/MessageBar';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import {useGetAppHasUpdateAvailable} from './hooks';

const UpdateNeeded = () => {
  const {t} = useTranslation('UpdateNeeded');

  const updateAvailable = useGetAppHasUpdateAvailable({
    forceUpdate: true,
  });

  const {isNeeded: isAppUpdateNeeded, storeUrl = false} = updateAvailable || {
    isNeeded: false,
  };

  const onStoreButtonPressed = useCallback(() => {
    storeUrl && Linking.openURL(storeUrl);
  }, [storeUrl]);

  if (!isAppUpdateNeeded) {
    return null;
  }

  return (
    <MessageBar
      label={
        <TextBase size="s" allowMultipleLines={true} isBackgroundSuccess={true}>
          {t('Common:update_ready.title')}
        </TextBase>
      }
      type="info"
      buttonLabel={t('Common:update_ready.button')}
      onPress={onStoreButtonPressed}
    />
  );
};
export default UpdateNeeded;

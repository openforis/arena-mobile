import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

const BaseValueRenderer = ({nodeDef}) => {
  const {t} = useTranslation();
  return (
    <View>
      <TextBase type="secondary">
        {t('Common:not_supported')}: {nodeDef.type}{' '}
      </TextBase>
    </View>
  );
};

export default BaseValueRenderer;

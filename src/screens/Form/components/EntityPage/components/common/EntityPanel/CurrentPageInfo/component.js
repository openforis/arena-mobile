import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors} from 'state/form';

import EntityNodeSelector from '../EntityNodeSelector';

import styles from './styles';

const CurrentPageInfo = () => {
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});
  const {t} = useTranslation();
  return (
    <>
      <Text style={[styles.headerTextInfo]}>
        {t('Form:navigation_panel.current_page')}:
      </Text>
      <View style={styles.container}>
        <Text style={[styles.headerText, styles.label]}>{label}</Text>
        <View style={styles.selectorContainer}>
          <EntityNodeSelector theme="neutral" />
        </View>
      </View>
    </>
  );
};

export default CurrentPageInfo;

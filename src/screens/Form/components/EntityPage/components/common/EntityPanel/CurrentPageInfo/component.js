import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors} from 'state/form';

import EntityNodeSelector from '../EntityNodeSelector';

import styles from './styles';

const CurrentLabel = () => {
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});
  return <TextBase customStyle={styles.label}>{label}</TextBase>;
};

const CurrentPageInfo = () => {
  const {t} = useTranslation();
  const showMultipleEntityHome = useSelector(
    formSelectors.showMultipleEntityHome,
  );

  return (
    <>
      <TextBase size="s" style={styles.headerTextInfo}>
        {t('Form:navigation_panel.current_page')}:
      </TextBase>
      <View style={styles.container}>
        <CurrentLabel />
        {!showMultipleEntityHome && (
          <View style={styles.selectorContainer}>
            <EntityNodeSelector theme="neutral" />
          </View>
        )}
      </View>
    </>
  );
};

export default CurrentPageInfo;

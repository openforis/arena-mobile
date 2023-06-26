import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';

import DeleteNodeEntity from '../DeleteNodeEntity';
import NewItemButton from '../NewItemButton';

import _styles from './styles';

const MultipleEntityOptions = () => {
  const styles = useThemedStyles(_styles);
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (
    !NodeDefs.isMultiple(parentEntityNodeDef) ||
    NodeDefs.isEnumerate(parentEntityNodeDef)
  ) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <DeleteNodeEntity />
      <NewItemButton
        visible={true}
        customContainerStyle={styles.button}
        styleTheme="neutral"
      />
    </View>
  );
};

export default MultipleEntityOptions;

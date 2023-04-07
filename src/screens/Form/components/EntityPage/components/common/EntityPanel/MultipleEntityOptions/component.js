import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

import DeleteNodeEntity from '../DeleteNodeEntity';
import NewItemButton from '../NewItemButton';

import styles from './styles';

const MultipleEntityOptions = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  if (parentEntityNodeDef.props.enumerate) {
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

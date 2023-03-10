import React from 'react';
import {View, Text} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Button from 'arena-mobile-ui/components/Button';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import baseStyles from 'arena-mobile-ui/styles';
import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {useIsTable} from 'screens/Form/components/EntityPage/components/common/EntityPanel/NewItemButton/component';
import {selectors as formSelectors} from 'state/form';

import DeleteNodeEntity from './DeleteNodeEntity';
import EntityNodeSelector from './EntityNodeSelector';
import Navigation from './Navigation';
import NewItemButton from './NewItemButton';
import styles from './styles';

const SHOW_TREE_BUTTON = false;

const MultipleEntityOptions = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return (
    <View
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}>
      <DeleteNodeEntity />
      <NewItemButton
        visible={true}
        customContainerStyle={styles.button}
        styleTheme="neutral"
      />
    </View>
  );
};

const EntityPanel = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );

  const isTable = useIsTable();

  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});

  return (
    <View
      style={[
        styles.container,
        isTablet() && isEntitySelectorOpened
          ? styles.containerTabletMenuOpen
          : {},
      ]}>
      <View style={styles.header}>
        {SHOW_TREE_BUTTON && (
          <EntitySelectorToggler customStyle={[styles.navigationBottom]} />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.headerTextInfo]}>Current page:</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: '',
              alignItems: 'center',
              maxWidth: 300,
            }}>
            <Text style={[styles.headerText, {maxWidth: 160}]}>{label}</Text>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <EntityNodeSelector theme="neutral" />
            </View>
          </View>
          {isTable && (
            <>
              <Button
                type="ghost"
                label={'Show as table'}
                customContainerStyle={[styles.buttonContainer, styles.addItem]}
                bold={false}
              />
            </>
          )}
        </View>
        <MultipleEntityOptions />
      </View>
      <Navigation />
      <Text
        style={{
          textAlign: 'center',
          fontSize: baseStyles.fontSizes.s,
          color: colors.neutralLight,
        }}>
        All the data entered is stored locally and automatically
      </Text>
    </View>
  );
};

export default EntityPanel;

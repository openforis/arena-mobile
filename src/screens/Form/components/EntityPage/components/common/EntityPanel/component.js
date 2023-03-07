import React from 'react';
import {View, Text} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import baseStyles from 'arena-mobile-ui/styles';
import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {useIsTable} from 'screens/Form/components/EntityPage/components/common/MultipleEntityManager/NewItemButton/component';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import NewItemButton from '../MultipleEntityManager/NewItemButton';

import Navigation from './Navigation';
import styles from './styles';

const SHOW_TREE_BUTTON = false;

const EntityPanel = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );

  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );

  const isTable = useIsTable();

  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, parentEntityNode),
  );

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
          <Text style={[styles.headerText]}>
            {label} [{keys}]
          </Text>
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
        <View
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}>
          <Button
            type="deleteGhost"
            icon={
              <Icon
                name="trash-can-outline"
                size={baseStyles.fontSizes.l}
                color={colors.error}
              />
            }
            label={'Delete row'}
            customContainerStyle={[styles.buttonContainer, styles.addItem]}
          />
          <NewItemButton
            visible={true}
            customContainerStyle={styles.button}
            styleTheme="neutral"
          />
        </View>
      </View>
      <Navigation />
    </View>
  );
};

export default EntityPanel;

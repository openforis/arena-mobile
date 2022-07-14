import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import {actions as formActions} from 'state/form';
import {actions as nodesActions} from 'state/nodes';

import {Preview as BasePreview} from '../../common/Base';

import styles from './styles';

const BooleanOption = ({label, active = false, onPress}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      style={[styles.touchableContainer({active})]}>
      <Icon
        name={active ? 'radio-button-on-outline' : 'radio-button-off-outline'}
        size={baseStyles.bases.BASE_4}
        color={active ? colors.primaryContrastText : colors.secondary}
      />
      <Text style={[styles.touchableLabel({active})]}>{label}</Text>
    </TouchableOpacity>
  );
};

const Boolean = ({node, nodeDef}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const handleClose = useCallback(() => {
    dispatch(formActions.setNode({node: false}));
  }, [dispatch]);

  const handlePress = useCallback(
    value => event => {
      event.stopPropagation();
      event.preventDefault();

      dispatch(
        nodesActions.updateNode({
          updatedNode: {
            ...node,
            value: String(value),
          },
          callback: handleClose,
        }),
      );
    },
    [dispatch, node, handleClose],
  );

  return (
    <View style={[styles.container]}>
      <BooleanOption
        label={t(
          `Form:nodeDefBoolean.labelValue.${
            nodeDef.props.labelValue || 'trueFalse'
          }.true`,
        )}
        active={node.value === String(true)}
        onPress={handlePress(true)}
      />
      <BooleanOption
        label={t(
          `Form:nodeDefBoolean.labelValue.${
            nodeDef.props.labelValue || 'trueFalse'
          }.false`,
        )}
        active={node.value === String(false)}
        onPress={handlePress(false)}
      />
    </View>
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Boolean} />;
};

export default Preview;

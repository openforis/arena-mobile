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

const BooleanOption = ({value, active = false, onPress, nodeDef}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress(value)}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      style={[styles.touchableContainer({active})]}>
      <Icon
        name={active ? 'radiobox-marked' : 'radiobox-blank'}
        size={baseStyles.bases.BASE_4}
        color={active ? colors.primaryContrastText : colors.secondary}
      />
      <Text style={[styles.touchableLabel({active})]}>
        {t(
          `Form:nodeDefBoolean.labelValue.${
            nodeDef?.props.labelValue || 'trueFalse'
          }.${value}`,
        )}
      </Text>
    </TouchableOpacity>
  );
};

const Boolean = ({node, nodeDef}) => {
  const dispatch = useDispatch();

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
        active={node.value === String(true)}
        onPress={handlePress}
        nodeDef={nodeDef}
        value={true}
      />
      <BooleanOption
        active={node.value === String(false)}
        onPress={handlePress}
        nodeDef={nodeDef}
        value={false}
      />
    </View>
  );
};

const Preview = ({nodeDef}) => {
  return <BasePreview nodeDef={nodeDef} NodeValueRender={Boolean} />;
};

export default Preview;

import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as formSelectors} from 'state/form';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';

import {Preview as BasePreview} from '../../common/Base';

import styles from './styles';

const BooleanOption = ({value, active = false, onPress, nodeDef}) => {
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress(value)}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      disabled={!applicable}
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

const BooleanAttribute = ({node, nodeDef}) => {
  const updateNode = useUpdateNode();

  const handlePress = useCallback(
    value => event => {
      event.stopPropagation();
      event.preventDefault();

      updateNode({node, value: String(value)});
    },
    [updateNode, node],
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
  return <BasePreview nodeDef={nodeDef} NodeValueRender={BooleanAttribute} />;
};

export default Preview;

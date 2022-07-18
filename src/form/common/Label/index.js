import React from 'react';
import {View, Text} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

const Label = ({nodeDef, customStyles = {}, iconColor = null}) => {
  const label = useNodeDefNameOrLabel({nodeDef});

  return (
    <View style={styles.container}>
      {nodeDef.props.key && (
        <>
          <Icon
            name="key-variant"
            size={baseStyles.bases.BASE_3}
            color={iconColor}
          />
          <View style={styles.separator} />
        </>
      )}

      <Text style={[styles.textStyle, customStyles.textStyle || {}]}>
        {label}
      </Text>
    </View>
  );
};

export default Label;

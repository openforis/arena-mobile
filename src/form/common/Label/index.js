import React from 'react';
import {View, Text} from 'react-native';

import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';

import styles from './styles';

const Label = ({nodeDef}) => {
  const label = useNodeDefNameOrLabel({nodeDef});

  return (
    <View style={styles.container}>
      {nodeDef.props.key && <Icon name="key" size={12} />}
      <Text style={styles.textStyle}>{label}</Text>
    </View>
  );
};

export default Label;

import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

const aligmentByType = {
  [NodeDefType.text]: 'flex-start',
  [NodeDefType.code]: 'flex-start',
  [NodeDefType.date]: 'center',
  [NodeDefType.time]: 'center',
  [NodeDefType.boolean]: 'flex-start',
};

const styles = StyleSheet.create({
  container: ({nodeDef}) => ({
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    padding: 8,
    alignItems: aligmentByType[nodeDef.type] || 'flex-end',
  }),
});

export default styles;

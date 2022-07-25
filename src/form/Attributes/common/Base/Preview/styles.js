import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const aligmentByType = {
  [NodeDefType.text]: 'flex-start',
  [NodeDefType.code]: 'flex-start',
  [NodeDefType.date]: 'center',
  [NodeDefType.time]: 'center',
  [NodeDefType.boolean]: 'flex-start',
  [NodeDefType.coordinate]: 'flex-start',
};
const paddingByType = {
  [NodeDefType.boolean]: 0,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  nodeContainer: ({nodeDef, isActive}) => ({
    borderColor: colors.neutralLighter,
    borderWidth: [
      NodeDefType.text,
      NodeDefType.integer,
      NodeDefType.decimal,
      NodeDefType.code,
      NodeDefType.time,
      NodeDefType.date,
      NodeDefType.coordinate,
    ].includes(nodeDef.type)
      ? 1
      : 0,
    justifyContent: 'center',
    padding:
      paddingByType[nodeDef.type] !== undefined
        ? paddingByType[nodeDef.type]
        : 8,
    alignItems: aligmentByType[nodeDef.type] || 'flex-end',
    opacity: isActive ? 1 : 0.5,
  }),
});

export default styles;

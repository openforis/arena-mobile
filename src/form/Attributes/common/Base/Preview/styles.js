import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

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
    ].includes(nodeDef.type)
      ? 1
      : 0,
    justifyContent: 'center',
    padding: 8,
    alignItems: [NodeDefType.text, NodeDefType.code].includes(nodeDef.type)
      ? 'flex-start'
      : 'flex-end',
    opacity: isActive ? 1 : 0.5,
  }),
});

export default styles;

import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  nodeContainer: ({nodeDef}) => ({
    borderColor: colors.neutralLighter,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 8,
    alignItems: nodeDef.type === NodeDefType.text ? 'flex-start' : 'flex-end',
  }),
});

export default styles;

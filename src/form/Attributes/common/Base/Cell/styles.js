import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

import baseStyles from 'arena-mobile-ui/styles';
import * as colors from 'arena-mobile-ui/colors';

const aligmentByType = {
  [NodeDefType.integer]: 'flex-end',
  [NodeDefType.decimal]: 'flex-end',
  [NodeDefType.text]: 'flex-start',
  [NodeDefType.boolean]: 'flex-start',
  [NodeDefType.date]: 'center',
  [NodeDefType.time]: 'center',
  [NodeDefType.code]: 'flex-start',
  [NodeDefType.file]: 'flex-start',
  [NodeDefType.coordinate]: 'flex-start',
};

const styles = StyleSheet.create({
  container: ({nodeDef, applicable}) => ({
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    padding: baseStyles.bases.BASE_2,
    alignItems: aligmentByType[nodeDef.type] || 'flex-end',
    flexDirection: 'row',
    opacity: applicable ? 1 : 0.5,
    backgroundColor: applicable ? colors.white : colors.neutralLight,
  }),
});

export default styles;

import {NodeDefType} from '@openforis/arena-core';
import {StyleSheet} from 'react-native';

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
  [NodeDefType.taxon]: 0,
};

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    container: {
      paddingTop: baseStyles.bases.BASE,
      paddingBottom: baseStyles.bases.BASE_3,
      paddingHorizontal: baseStyles.bases.BASE_3,
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: colors.backgroundDarker,
    },
    basePreviewContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    nodeContainer: ({nodeDef}) => ({
      borderColor: colors.borderColorSecondary,
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
      padding:
        paddingByType[nodeDef.type] !== undefined
          ? paddingByType[nodeDef.type]
          : baseStyles.bases.BASE_2,
      alignItems: aligmentByType[nodeDef.type] || 'flex-end',
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 1,
    }),
    buttonContainer: {
      justifyContent: 'flex-end',
      margin: 0,
      paddingTop: baseStyles.bases.BASE,
    },
    lastNodeDef: {
      backgroundColor: colors.activeBackground,
    },
    block: {
      flex: 1,
    },
  });

export default styles;

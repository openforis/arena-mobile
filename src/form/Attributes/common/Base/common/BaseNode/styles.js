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

const noPadding = [NodeDefType.boolean, NodeDefType.taxon];
const noPaddingEditablePreview = [
  NodeDefType.boolean,
  NodeDefType.taxon,
  NodeDefType.code,
];

const withBorderPreview = [
  NodeDefType.text,
  NodeDefType.integer,
  NodeDefType.decimal,
  NodeDefType.code,
  NodeDefType.time,
  NodeDefType.date,
  NodeDefType.coordinate,
];

const withBorderEditablePreview = [
  NodeDefType.code,
  NodeDefType.time,
  NodeDefType.date,
  NodeDefType.coordinate,
];

const styles = ({colors, baseStyles}) =>
  StyleSheet.create({
    nodeContainer: ({nodeDef, isSingleNodeView}) => ({
      borderColor: colors.borderColorSecondary,
      borderWidth: (isSingleNodeView
        ? withBorderEditablePreview
        : withBorderPreview
      ).includes(nodeDef.type)
        ? 1
        : 0,
      padding: (isSingleNodeView
        ? noPaddingEditablePreview
        : noPadding
      ).includes(nodeDef.type)
        ? 0
        : baseStyles.bases.BASE_2,

      alignItems: aligmentByType[nodeDef.type] || 'flex-end',
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 1,
    }),
    block: {
      flex: 1,
    },
    disabled: {
      backgroundColor: colors.disabledBackground,
    },
    baseContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
  });

export default styles;

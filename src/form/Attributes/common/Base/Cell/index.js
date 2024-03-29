import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import Validation from 'form/common/Validation';
import {selectors as formSelectors} from 'state/form';

import _styles from './styles';

const BaseValuesRenderer = ({nodes}) => {
  return (
    <TextBase numberOfLines={1}>
      {nodes?.map(node => node.value).join(',')}
    </TextBase>
  );
};

const Cell = ({nodeDef, nodes, ValuesRender = BaseValuesRenderer}) => {
  const styles = useThemedStyles(_styles);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const containerStyle = useMemo(() => {
    return styles.container({nodeDef, applicable});
  }, [styles, nodeDef, applicable]);

  const nodesUuids = useMemo(() => nodes?.map(node => node.uuid), [nodes]);
  return (
    <View style={containerStyle}>
      <Validation
        nodeDef={nodeDef}
        nodesUuids={nodesUuids}
        showValidation={true}
      />
      {nodes.length > 0 && (
        <ValuesRender nodes={nodes} nodeDef={nodeDef} applicable={applicable} />
      )}
    </View>
  );
};

export default Cell;

import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import Validation from 'form/common/Validation';
import {selectors as formSelectors} from 'state/form';

import styles from './styles';

const BaseValuesRenderer = ({nodes}) => {
  return (
    <TextBase numberOfLines={1}>
      {nodes.map(node => node.value).join(',')}
    </TextBase>
  );
};

const Cell = ({nodeDef, nodes, ValuesRender = BaseValuesRenderer}) => {
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const containerStyle = useMemo(() => {
    return styles.container({nodeDef, applicable});
  }, [nodeDef, applicable]);

  return (
    <View style={containerStyle}>
      <Validation nodeDef={nodeDef} nodes={nodes} showValidation={true} />
      {nodes.length > 0 && (
        <ValuesRender nodes={nodes} nodeDef={nodeDef} applicable={applicable} />
      )}
    </View>
  );
};

export default Cell;

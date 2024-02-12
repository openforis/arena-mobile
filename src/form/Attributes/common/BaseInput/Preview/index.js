import {NodeDefType} from '@openforis/arena-core';
import React, {useMemo} from 'react';

import {getValueAsString} from 'arena/node';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import {Preview as BasePreview} from '../../Base';

import styles from './styles';

const NodeValueRender = ({node, nodeDef}) => {
  const customStyle = useMemo(() => {
    return nodeDef.type === NodeDefType.text
      ? styles.textAlignLeft
      : styles.textAlignRight;
  }, [nodeDef.type]);

  return (
    <TextBase size="l" cusomStyle={customStyle}>
      {getValueAsString(nodeDef, node)}
    </TextBase>
  );
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default React.memo(
  Preview,
  (prevProps, nextProps) => prevProps.nodeDef.uuid === nextProps.nodeDef.uuid,
);

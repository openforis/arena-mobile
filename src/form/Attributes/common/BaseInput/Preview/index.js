import {NodeDefType} from '@openforis/arena-core';
import React from 'react';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import {Preview as BasePreview} from '../../Base';
import {getValueAsString} from '../Form';

import styles from './styles';

const NodeValueRender = ({node, nodeDef}) => {
  return (
    <TextBase
      size="l"
      cusomStyle={[
        nodeDef.type === NodeDefType.text
          ? styles.textAlignLeft
          : styles.textAlignRight,
      ]}>
      {getValueAsString(nodeDef, node)}
    </TextBase>
  );
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;

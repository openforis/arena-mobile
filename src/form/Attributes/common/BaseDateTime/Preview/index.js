import {NodeDefType} from '@openforis/arena-core';
import React from 'react';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import {Preview as BasePreview} from '../../Base';

const placeHolder = {
  [NodeDefType.time]: 'HH:MM',
  [NodeDefType.date]: 'YYYY-MM-DD',
};
const NodeValueRender = ({node, nodeDef}) => {
  return <TextBase>{node.value || placeHolder[nodeDef.type]}</TextBase>;
};

const Preview = ({nodeDef}) => (
  <BasePreview nodeDef={nodeDef} NodeValueRender={NodeValueRender} />
);

export default Preview;

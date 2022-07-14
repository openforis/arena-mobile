import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';

import BooleanPreview from '../../Attributes/Boolean/Preview';
import CodePreview from '../../Attributes/Code/Preview';
import BasePreview from '../../Attributes/common/Base/Preview';
import DatePreview from '../../Attributes/Date/Preview';
import DecimalPreview from '../../Attributes/Decimal/Preview';
import IntegerPreview from '../../Attributes/Integer/Preview';
import TextPreview from '../../Attributes/Text/Preview';
import TimePreview from '../../Attributes/Time/Preview';

const AttributesComponentByType = {
  [NodeDefType.integer]: IntegerPreview,
  [NodeDefType.decimal]: DecimalPreview,
  [NodeDefType.text]: TextPreview,
  [NodeDefType.code]: CodePreview,
  [NodeDefType.boolean]: BooleanPreview,
  [NodeDefType.date]: DatePreview,
  [NodeDefType.time]: TimePreview,
};

const Attribute = ({nodeDefUuid}) => {
  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );
  return React.createElement(
    AttributesComponentByType[nodeDef.type] || BasePreview,
    {
      nodeDef,
      type: nodeDef.type,
    },
  );
};

export default Attribute;

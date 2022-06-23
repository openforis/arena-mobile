import React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';

import BasePreview from '../../Attributes/common/Base/Preview';
import DecimalPreview from '../../Attributes/Decimal/Preview';
import IntegerPreview from '../../Attributes/Integer/Preview';
import TextPreview from '../../Attributes/Text/Preview';

const AttributesComponentByType = {
  integer: IntegerPreview,
  decimal: DecimalPreview,
  text: TextPreview,
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

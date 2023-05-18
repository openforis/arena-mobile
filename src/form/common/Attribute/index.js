import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';

import BooleanPreview from '../../Attributes/Boolean/Preview';
import CodePreview from '../../Attributes/Code/Preview';
import BasePreview from '../../Attributes/common/Base/Preview';
import CoordinatePreview from '../../Attributes/Coordinate/Preview';
import DatePreview from '../../Attributes/Date/Preview';
import DecimalPreview from '../../Attributes/Decimal/Preview';
import EntityPreview from '../../Attributes/Entity/Preview';
import FilePreview from '../../Attributes/File/Preview';
import IntegerPreview from '../../Attributes/Integer/Preview';
import TaxonomyPreview from '../../Attributes/Taxonomy/Preview';
import TextPreview from '../../Attributes/Text/Preview';
import TimePreview from '../../Attributes/Time/Preview';

const AttributesComponentByType = {
  [NodeDefType.integer]: IntegerPreview,
  [NodeDefType.decimal]: DecimalPreview,
  [NodeDefType.text]: TextPreview,
  [NodeDefType.code]: CodePreview,
  [NodeDefType.coordinate]: CoordinatePreview,
  [NodeDefType.boolean]: BooleanPreview,
  [NodeDefType.date]: DatePreview,
  [NodeDefType.time]: TimePreview,
  [NodeDefType.file]: FilePreview,
  [NodeDefType.taxon]: TaxonomyPreview,
  [NodeDefType.entity]: EntityPreview,
};

const Attribute = ({nodeDefUuid}) => {
  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );

  if (!Object.keys(AttributesComponentByType).includes(nodeDef.type)) {
    return null;
  }
  if (nodeDef?.analysis) {
    return null;
  }

  return React.createElement(
    AttributesComponentByType[nodeDef.type] || BasePreview,
    {
      nodeDef,
    },
  );
};

export default Attribute;

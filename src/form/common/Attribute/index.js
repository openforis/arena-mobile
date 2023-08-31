import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';

import BooleanEditablePreview from '../../Attributes/Boolean/EditablePreview';
import BooleanPreview from '../../Attributes/Boolean/Preview';
import CodePreview from '../../Attributes/Code/Preview';
import BaseEditablePreview from '../../Attributes/common/Base/EditablePreview';
import BasePreview from '../../Attributes/common/Base/Preview';
import CoordinatePreview from '../../Attributes/Coordinate/Preview';
import DateEditablePreview from '../../Attributes/Date/EditablePreview';
import DatePreview from '../../Attributes/Date/Preview';
import DecimalEditablePreview from '../../Attributes/Decimal/EditablePreview';
import DecimalPreview from '../../Attributes/Decimal/Preview';
import EntityPreview from '../../Attributes/Entity/Preview';
import FileEditablePreview from '../../Attributes/File/EditablePreview';
import FilePreview from '../../Attributes/File/Preview';
import IntegerEditablePreview from '../../Attributes/Integer/EditablePreview';
import IntegerPreview from '../../Attributes/Integer/Preview';
import TaxonomyEditablePreview from '../../Attributes/Taxonomy/EditablePreview';
import TaxonomyPreview from '../../Attributes/Taxonomy/Preview';
import TextEditablePreview from '../../Attributes/Text/EditablePreview';
import TextPreview from '../../Attributes/Text/Preview';
import TimeEditablePreview from '../../Attributes/Time/EditablePreview';
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

const AttributesEditablesComponentByType = {
  [NodeDefType.integer]: IntegerEditablePreview,
  [NodeDefType.decimal]: DecimalEditablePreview,
  [NodeDefType.text]: TextEditablePreview,
  [NodeDefType.code]: CodePreview,
  [NodeDefType.coordinate]: CoordinatePreview,
  [NodeDefType.boolean]: BooleanEditablePreview,
  [NodeDefType.date]: DateEditablePreview,
  [NodeDefType.time]: TimeEditablePreview,
  [NodeDefType.file]: FileEditablePreview,
  [NodeDefType.taxon]: TaxonomyEditablePreview,
  [NodeDefType.entity]: EntityPreview,
};

const singleNodeView = false;
const Attribute = ({nodeDefUuid}) => {
  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );

  if (
    !Object.keys(AttributesComponentByType).includes(nodeDef.type) &&
    !singleNodeView
  ) {
    return null;
  }
  if (
    !Object.keys(AttributesEditablesComponentByType).includes(nodeDef.type) &&
    singleNodeView
  ) {
    return null;
  }
  if (nodeDef?.analysis) {
    return null;
  }

  if (singleNodeView) {
    return React.createElement(
      AttributesEditablesComponentByType[nodeDef.type] || BaseEditablePreview,
      {
        nodeDef,
      },
    );
  }

  return React.createElement(
    AttributesComponentByType[nodeDef.type] || BasePreview,
    {
      nodeDef,
    },
  );
};

export default Attribute;

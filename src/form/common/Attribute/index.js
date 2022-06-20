import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as surveySelectors} from 'state/survey';

import IntegerPreview from '../../Attributes/Integer/Preview';
import TextPreview from '../../Attributes/Text/Preview';

const Base = ({nodeDef, type}) => (
  <View>
    <Text>
      {nodeDef.type} - {type} - Not suported
    </Text>
  </View>
);

const AttributesComponentByType = {
  integer: IntegerPreview,
  text: TextPreview,
};

const Attribute = ({nodeDefUuid}) => {
  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );
  return React.createElement(AttributesComponentByType[nodeDef.type] || Base, {
    nodeDef,
    type: nodeDef.type,
  });
};

export default Attribute;

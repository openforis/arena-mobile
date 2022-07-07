import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import {Preview as BasePreview} from '../../common/Base';

const PreviewCode = ({node}) => {
  const categoryItem = useSelector(state =>
    surveySelectors.getCategoryItemByUuid(state, node?.value?.itemUuid),
  );

  return <Text>{categoryItem?.props?.code || ''}</Text>;
};

const useIsActive = ({node, nodeDef}) => {
  const parentCodeNode = useSelector(state =>
    surveySelectors.getParentCodeNode(state, nodeDef, node),
  );

  return parentCodeNode === false || parentCodeNode?.value?.itemUuid;
};

const Preview = ({nodeDef}) => {
  if (!nodeDef.props.multiple) {
    return (
      <BasePreview
        nodeDef={nodeDef}
        NodeValueRender={PreviewCode}
        useIsActive={useIsActive}
      />
    );
  }
  return (
    <View>
      <Text>Multi</Text>
    </View>
  );
};

export default Preview;

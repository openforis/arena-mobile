import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

const BreadCrumb = ({breadCrumb: node}) => {
  const dispatch = useDispatch();
  const nodeDefsByUuid = useSelector(surveySelectors.getNodeDefsByUuid);
  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, node),
  );

  const nodeDefName = useNodeDefNameOrLabel({
    nodeDef: nodeDefsByUuid[node.nodeDefUuid],
  });

  const handleSelect = React.useCallback(() => {
    dispatch(
      formActions.setParentEntityNode({
        node,
      }),
    );
  }, [node, dispatch]);
  return (
    <TouchableOpacity onPress={handleSelect}>
      <Text key={node.key}>
        {nodeDefName}[{keys}]
      </Text>
    </TouchableOpacity>
  );
};

export default BreadCrumb;

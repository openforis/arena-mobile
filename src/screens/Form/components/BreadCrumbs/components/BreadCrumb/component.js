import * as React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

const BreadCrumb = ({breadCrumb: node}) => {
  const dispatch = useDispatch();
  const nodeDefsByUuid = useSelector(surveySelectors.getNodeDefsByUuid);
  const entityNodeKeys = useSelector(state =>
    surveySelectors.getEntityNodeKeys(state, node),
  );

  const handleSelect = React.useCallback(() => {
    dispatch(
      formActions.setNodeDefWithNode({
        nodeDef: nodeDefsByUuid[node.nodeDefUuid],
        node: node,
      }),
    );
  }, [node, nodeDefsByUuid, dispatch]);
  return (
    <TouchableOpacity onPress={handleSelect}>
      <Text key={node.key}>
        {nodeDefsByUuid[node.nodeDefUuid].props.name} ({node.uuid.split('-')[0]}
        ) [{entityNodeKeys.map(nodeKey => nodeKey.value).join(',')}]
      </Text>
    </TouchableOpacity>
  );
};

export default BreadCrumb;

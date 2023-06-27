import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const BreadCrumb = ({breadCrumb: node}) => {
  const styles = useThemedStyles(_styles);
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
    <TouchableOpacity onPress={handleSelect} style={styles.container}>
      <TextBase>
        {nodeDefName}[{keys}]
      </TextBase>
    </TouchableOpacity>
  );
};

export default BreadCrumb;

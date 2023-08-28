import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const Label = React.memo(
  ({node}) => {
    const nodeDefsByUuid = useSelector(surveySelectors.getNodeDefsByUuid);
    const keys = useSelector(state =>
      surveySelectors.getEntityNodeKeys(state, node),
    );
    const keysAsString = useSelector(state =>
      surveySelectors.getEntityNodeKeysAsString(state, node),
    );

    const nodeDefName = useNodeDefNameOrLabel({
      nodeDef: nodeDefsByUuid[node.nodeDefUuid],
    });

    const breadCrumbLabel = useMemo(() => {
      return `${nodeDefName} ${keys.length > 0 ? `[${keysAsString}]` : ''}`;
    }, [nodeDefName, keysAsString, keys]);

    return <TextBase>{breadCrumbLabel}</TextBase>;
  },
  (prevProps, nextProps) => {
    return prevProps.node.uuid === nextProps.node.uuid;
  },
);

const BreadCrumb = ({nodeUuid}) => {
  const styles = useThemedStyles(_styles);
  const dispatch = useDispatch();
  const node = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, nodeUuid),
  );

  const handleSelect = React.useCallback(() => {
    dispatch(
      formActions.setParentEntityNode({
        node,
      }),
    );
  }, [node, dispatch]);

  return (
    <View style={styles.breadCrumbContainer}>
      <Pressable onPress={handleSelect} style={styles.container}>
        <Label node={node} />
      </Pressable>
    </View>
  );
};

export default React.memo(BreadCrumb, (prevProps, nextProps) => {
  return prevProps.nodeUuid === nextProps.nodeUuid;
});

export const BreadCrumbAsLabel = ({nodeUuid}) => {
  const node = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, nodeUuid),
  );
  return <Label node={node} />;
};

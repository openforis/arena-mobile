import React, {useMemo, useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Pressable from 'arena-mobile-ui/components/Pressable';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {actions as formActions, selectors as formSelectors} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';

const Label = React.memo(
  ({node}) => {
    const nodeDefsByUuid = useSelector(surveySelectors.getNodeDefsByUuid);
    const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
    const keys = useSelector(state =>
      surveySelectors.getEntityNodeKeys(state, node),
    );
    const keysAsString = useSelector(state =>
      surveySelectors.getEntityNodeKeysAsStringWithLabel(state, node),
    );

    const nodeDefName = useNodeDefNameOrLabel({
      nodeDef: nodeDefsByUuid[node.nodeDefUuid],
    });

    const breadCrumbLabel = useMemo(() => {
      return `${nodeDefName} ${keys.length > 0 ? `[${keysAsString}]` : ''}`;
    }, [nodeDefName, keysAsString, keys]);

    return (
      <TextBase type={parentEntityNode.uuid === node.uuid ? 'bold' : 'regular'}>
        {breadCrumbLabel}
      </TextBase>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.node.uuid === nextProps.node.uuid;
  },
);

const BreadCrumb = ({nodeUuid, emptyNode}) => {
  const styles = useThemedStyles(_styles);
  const dispatch = useDispatch();
  const node = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, nodeUuid),
  );

  const handleSelect = useCallback(() => {
    dispatch(
      formActions.setParentEntityNode({
        node: node || emptyNode,
      }),
    );
  }, [node, emptyNode, dispatch]);

  return (
    <View style={styles.breadCrumbContainer}>
      <Pressable onPress={handleSelect} style={styles.container}>
        <Label node={node || emptyNode} />
      </Pressable>
    </View>
  );
};

export const BreadCrumbMultipleHome = () => {
  const currentParentEntityNode = useSelector(
    formSelectors.getParentEntityNode,
  );
  const showMultipleEntityHome = useSelector(
    formSelectors.showMultipleEntityHome,
  );

  const parentEntityNodeDefUuid = useSelector(
    formSelectors.getParentEntityNodeDefUuid,
  );

  const shouldShow = useMemo(() => {
    if (
      showMultipleEntityHome &&
      currentParentEntityNode.nodeDefUuid !== parentEntityNodeDefUuid
    ) {
      return true;
    }
  }, [
    showMultipleEntityHome,
    parentEntityNodeDefUuid,
    currentParentEntityNode,
  ]);

  if (!shouldShow) {
    return <></>;
  }
  return (
    <BreadCrumb
      emptyNode={{
        uuid: null,
        nodeDefUuid: parentEntityNodeDefUuid,
      }}
    />
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

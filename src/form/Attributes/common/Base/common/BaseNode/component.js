import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import {getValueAsString} from 'arena/node';
import Pressable from 'arena-mobile-ui/components/Pressable';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import CopyToClipboard from 'form/Attributes/common/CopyToClipboard';
import Validation from 'form/common/Validation';
import {selectors as formSelectors} from 'state/form';
import {useSelectNodeAndNodeDef} from 'state/form/hooks/useNodeFormActions';
import formPreferencesSelectors from 'state/form/selectors/preferences';
import nodesSelectors from 'state/nodes/selectors';
import BaseDeleteNode from '../BaseDeleteNode';

import _styles from './styles';

const BaseNode = ({
  nodeUuid,
  nodeDef,
  showValidation,
  NodeValueRender,
  canDelete,
  parentEntityNode,
  keyboardType,
}) => {
  const styles = useThemedStyles(_styles);

  const node = useSelector(state =>
    nodesSelectors.getNodeByUuid(state, nodeUuid),
  );
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );
  const isReadOnly = NodeDefs.isReadOnly(nodeDef);
  const isSingleNodeView = useSelector(
    formPreferencesSelectors.isSingleNodeView,
  );

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({node, nodeDef});

  const validation = useMemo(() => {
    if (!showValidation) {
      return null;
    }
    if (!node?.uuid) {
      return null;
    }

    return (
      <Validation
        nodeDef={nodeDef}
        nodesUuids={[node.uuid]}
        showValidation={showValidation}
        absolute={true}
        parentEntityNode={parentEntityNode}
      />
    );
  }, [nodeDef, node, showValidation, parentEntityNode]);

  const styleNodeContainer = useMemo(() => {
    return StyleSheet.compose(
      styles.nodeContainer({nodeDef, isSingleNodeView}),
      disabled ? styles.disabled : {},
    );
  }, [styles, nodeDef, disabled, isSingleNodeView]);

  const nodeRendered = useMemo(() => {
    return (
      <>
        <View style={isSingleNodeView ? styles.blockSingleNode : styles.block}>
          <NodeValueRender
            node={node}
            nodeDef={nodeDef}
            keyboardType={keyboardType}
          />
        </View>

        {validation}
      </>
    );
  }, [node, nodeDef, styles, validation, keyboardType, isSingleNodeView]);
  if (!node) return null;
  return (
    <View style={styles.baseContainer}>
      <Pressable
        style={styleNodeContainer}
        onPress={handleSelectNodeAndNodeDef}
        disabled={disabled}>
        {nodeRendered}
      </Pressable>
      {isReadOnly && (
        <CopyToClipboard value={getValueAsString(nodeDef, node)} />
      )}

      {canDelete && <BaseDeleteNode node={node} />}
    </View>
  );
};

export default BaseNode;

import React, {useEffect, useMemo, useState} from 'react';
import {PanResponder} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';

import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';
import {selectors as nodesSelectors} from 'state/nodes';

const SingleNode = () => {
  const nodeDefChildrenUuids = useAttributesUuids();
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const lastNodeDefUuid = useSelector(nodesSelectors.getLastNodeDefUuid);
  const [positionSelected, setPositionSelected] = useState(-1);

  useEffect(() => {
    setPositionSelected(nodeDefChildrenUuids.indexOf(lastNodeDefUuid) !== -1);
  }, [nodeDefChildrenUuids, lastNodeDefUuid]);

  useEffect(() => {
    setPositionSelected(0);
  }, [parentEntityNode]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderRelease: (_, gestureState) => {
          const {dx, dy} = gestureState;

          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              if (positionSelected > 0) {
                setPositionSelected(Math.max(positionSelected - 1, 0));
              }
            } else {
              if (positionSelected < nodeDefChildrenUuids.length - 1) {
                setPositionSelected(positionSelected + 1);
              }
            }
          }
        },
        onShouldBlockNativeResponder: () => false,
      }),

    [setPositionSelected, positionSelected, nodeDefChildrenUuids.length], // dependency list
  );

  return (
    <ScrollView {...panResponder.panHandlers}>
      <Attribute
        nodeDefUuid={nodeDefChildrenUuids[positionSelected]}
        shouldAutoSelect={true}
      />
    </ScrollView>
  );
};

export default SingleNode;

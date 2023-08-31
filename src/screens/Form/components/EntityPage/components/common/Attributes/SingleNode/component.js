import React, {useMemo, useState} from 'react';
import {View, PanResponder} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import Attribute from 'form/common/Attribute';

import _styles from './styles';

const SingleNode = React.memo(
  ({nodeDefChildrenUuids}) => {
    const styles = useThemedStyles(_styles);

    const [positionSelected, setPositionSelected] = useState(0);

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
      <View style={styles.container} {...panResponder.panHandlers}>
        <Attribute
          nodeDefUuid={nodeDefChildrenUuids[positionSelected]}
          shouldAutoSelect={true}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.nodeDefChildrenUuids === nextProps.nodeDefChildrenUuids;
  },
);

export default SingleNode;

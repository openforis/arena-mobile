import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import PagerView from "react-native-pager-view";
import Dots from "react-native-dots-pagination";

import { NodeDefs } from "@openforis/arena-core";

import { DataEntryActions, DataEntrySelectors } from "state/dataEntry";

import { VView, View } from "components";

import { NodeDefFormItem } from "../NodeDefFormItem";

import styles from "./styles";

export const RecordNodesCarousel = () => {
  const dispatch = useDispatch();
  const { entityDef, entityUuid, parentEntityUuid } =
    DataEntrySelectors.useCurrentPageEntity();

  if (__DEV__) {
    console.log(
      `rendering RecordNodesCarousel of ${NodeDefs.getName(entityDef)}`
    );
  }

  const pagerViewRef = useRef(null);
  const pagerViewScrollStateRef = useRef(null);

  const childrenDefs =
    DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const activeChildIndex =
    DataEntrySelectors.useCurrentPageEntityActiveChildIndex();

  const onPageSelected = useCallback(
    (e) => {
      const position = e.nativeEvent.position;
      dispatch(
        DataEntryActions.selectCurrentPageEntityActiveChildIndex(position)
      );
    },
    [dispatch]
  );

  const onPageScrollStateChanged = useCallback((e) => {
    pagerViewScrollStateRef.current = e.nativeEvent.pageScrollState;
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (
        pagerViewScrollStateRef.current === null ||
        pagerViewScrollStateRef.current === "idle"
      ) {
        // set page only when not scrolling to avoid polling between pages
        pagerViewRef.current?.setPage(activeChildIndex);
      }
    });
  }, [activeChildIndex, pagerViewRef, pagerViewScrollStateRef]);

  const pagerView = useMemo(() => {
    return (
      <PagerView
        offscreenPageLimit={2}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
        ref={pagerViewRef}
        style={styles.pager}
      >
        {childrenDefs.map((childDef) => (
          <View key={childDef.uuid} style={styles.childContainer}>
            <NodeDefFormItem nodeDef={childDef} parentNodeUuid={entityUuid} />
          </View>
        ))}
      </PagerView>
    );
  }, [childrenDefs, entityUuid, onPageSelected, onPageScrollStateChanged]);

  if (
    NodeDefs.isMultiple(entityDef) &&
    !NodeDefs.isRoot(entityDef) &&
    !entityUuid
  ) {
    return (
      <NodeDefFormItem nodeDef={entityDef} parentNodeUuid={parentEntityUuid} />
    );
  }

  return (
    <VView style={styles.container}>
      {pagerView}
      <Dots length={childrenDefs.length} active={activeChildIndex} />
    </VView>
  );
};

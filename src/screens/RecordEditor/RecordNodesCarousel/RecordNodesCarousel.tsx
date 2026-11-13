import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import PagerView from "react-native-pager-view";
import Dots from "react-native-dots-pagination";

import { NodeDefs } from "@openforis/arena-core";

import { DataEntryActions, DataEntrySelectors } from "state/dataEntry";
import { log } from "utils";

import { VView, View } from "components";
import { useAppDispatch } from "state/storeHooks";

import { NodeDefFormItem } from "../NodeDefFormItem";

import styles from "./styles";

export const RecordNodesCarousel = memo(() => {
  const dispatch = useAppDispatch();
  const { entityDef, entityUuid, parentEntityUuid } =
    DataEntrySelectors.useCurrentPageEntity();

  log.debug(`rendering RecordNodesCarousel of ${NodeDefs.getName(entityDef)}`);

  const pagerViewRef = useRef(null);
  const pagerViewScrollStateRef = useRef(null);

  const childrenDefs =
    DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const activeChildIndex =
    DataEntrySelectors.useCurrentPageEntityActiveChildIndex();

  const onPageSelected = useCallback(
    (e: any) => {
      const position = e.nativeEvent.position;
      dispatch(
        DataEntryActions.selectCurrentPageEntityActiveChildIndex(position),
      );
    },
    [dispatch],
  );

  const onPageScrollStateChanged = useCallback((e: any) => {
    pagerViewScrollStateRef.current = e.nativeEvent.pageScrollState;
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (
        pagerViewScrollStateRef.current === null ||
        pagerViewScrollStateRef.current === "idle"
      ) {
        // set page only when not scrolling to avoid polling between pages
        const pagerView: any = pagerViewRef.current;
        pagerView?.setPage(activeChildIndex);
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
        {childrenDefs.map((childDef, index) => (
          <View key={childDef.uuid} style={styles.childContainer}>
            {/* only pages next to the active one are mounted: each form item subscribes to the store */}
            {Math.abs(index - activeChildIndex) <= 1 && (
              <NodeDefFormItem nodeDef={childDef} parentNodeUuid={entityUuid} />
            )}
          </View>
        ))}
      </PagerView>
    );
  }, [
    activeChildIndex,
    childrenDefs,
    entityUuid,
    onPageSelected,
    onPageScrollStateChanged,
  ]);

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
});

RecordNodesCarousel.displayName = "RecordNodesCarousel";

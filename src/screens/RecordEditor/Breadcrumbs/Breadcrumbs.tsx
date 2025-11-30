import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";

import { useIsTextDirectionRtl } from "localization";
import { DataEntryActions } from "state/dataEntry/actions";
import { DataEntrySelectors } from "state/dataEntry/selectors";
import { useAppDispatch } from "state/store";
import { log } from "utils";

import { BreadcrumbItem } from "./BreadcrumbItem";
import { useBreadcrumbItems } from "./useBreadcrumbItems";

import styles from "./styles";

export const Breadcrumbs = () => {
  log.debug(`rendering Breadcrumbs`);
  const dispatch = useAppDispatch();
  const isRtl = useIsTextDirectionRtl();
  const scrollViewRef = useRef(null as any);

  const currentPageEntity = DataEntrySelectors.useCurrentPageEntity();
  const { entityDef } = currentPageEntity;
  const entityDefUuid = entityDef.uuid;

  useEffect(() => {
    // scroll to the end (right) when selected entity changes
    scrollViewRef?.current?.scrollToEnd({ animated: true });
  }, [entityDefUuid]);

  const items = useBreadcrumbItems();

  const onItemPress = useCallback(
    (pageEntityItem: any) => {
      dispatch(DataEntryActions.selectCurrentPageEntity(pageEntityItem));
    },
    [dispatch]
  );

  const scrollViewStyle = useMemo(
    () => [styles.scrollView, isRtl ? styles.scrollViewRtl : undefined],
    [isRtl]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      horizontal
      ref={scrollViewRef}
      style={scrollViewStyle}
    >
      {items.map((item, index) => (
        <BreadcrumbItem
          key={item.entityDefUuid}
          isLastItem={index === items.length - 1}
          item={item}
          onItemPress={onItemPress}
        />
      ))}
    </ScrollView>
  );
};

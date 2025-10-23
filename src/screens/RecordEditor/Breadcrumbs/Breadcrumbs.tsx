import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import { useDispatch } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'state/dataEntry/actions' or it... Remove this comment to see the full error message
import { DataEntryActions } from "state/dataEntry/actions";
// @ts-expect-error TS(2307): Cannot find module 'state/dataEntry/selectors' or ... Remove this comment to see the full error message
import { DataEntrySelectors } from "state/dataEntry/selectors";

import { BreadcrumbItem } from "./BreadcrumbItem";
import { useBreadcrumbItems } from "./useBreadcrumbItems";

import styles from "./styles";

export const Breadcrumbs = () => {
  if (__DEV__) {
    console.log(`rendering Breadcrumbs`);
  }
  const dispatch = useDispatch();
  const isRtl = useIsTextDirectionRtl();
  const scrollViewRef = useRef(null);

  const currentPageEntity = DataEntrySelectors.useCurrentPageEntity();
  const { entityDef } = currentPageEntity;
  const entityDefUuid = entityDef.uuid;

  useEffect(() => {
    // scroll to the end (right) when selected entity changes
    // @ts-expect-error TS(2339): Property 'scrollToEnd' does not exist on type 'nev... Remove this comment to see the full error message
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

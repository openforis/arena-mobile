import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  ListRenderItemInfo,
  VirtualizedList,
  type VirtualizedListInstance,
} from "react-native";

import {
  ArenaAnyNodeDef,
  ArenaNodeDefEntity,
  NodeDefs,
} from "@openforis/arena-core";

import { DataEntrySelectors } from "state";
import { log } from "utils";

import { NodeDefFormItem } from "../../../NodeDefFormItem";
import { NodeComponentProps } from "../nodeComponentPropTypes";

import styles from "./styles";

const keyExtractor = (childDef: ArenaAnyNodeDef) => childDef.uuid;

const getItem = (data: ArenaAnyNodeDef[], index: number) => data[index]!;

const getItemCount = (data: ArenaAnyNodeDef[]) => data.length;

type Props = NodeComponentProps<ArenaNodeDefEntity>;

export const NodeEntityFormComponent = memo((props: Props) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug(`rendering NodeDefEntityForm for ${NodeDefs.getName(nodeDef)}`);

  const listRef = useRef<VirtualizedListInstance>(null);

  const childrenDefs = DataEntrySelectors.useRecordEntityChildDefs({
    nodeDef,
  });

  useEffect(() => {
    const listEl = listRef.current;
    listEl?.scrollToOffset?.({ offset: 0, animated: false });
  }, [nodeDef, parentNodeUuid]);

  const renderItem = useCallback(
    ({ item: childDef }: ListRenderItemInfo<ArenaAnyNodeDef>) => (
      <NodeDefFormItem nodeDef={childDef} parentNodeUuid={parentNodeUuid} />
    ),
    [parentNodeUuid],
  );

  return (
    <VirtualizedList
      ref={listRef}
      data={childrenDefs}
      getItemCount={getItemCount}
      getItem={getItem}
      initialNumToRender={10}
      keyExtractor={keyExtractor}
      persistentScrollbar
      renderItem={renderItem}
      style={styles.container}
    />
  );
});

NodeEntityFormComponent.displayName = "NodeEntityFormComponent";

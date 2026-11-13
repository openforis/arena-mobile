import React, { memo, useCallback, useEffect, useRef } from "react";
import { ListRenderItemInfo, VirtualizedList } from "react-native";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";
import { log } from "utils";

import { NodeDefFormItem } from "../../../NodeDefFormItem";
import { NodeComponentProps } from "../nodeComponentPropTypes";

import styles from "./styles";

const keyExtractor = (childDef: NodeDef<any>) => childDef.uuid;

const getItem = (data: NodeDef<any>[], index: number) => data[index]!;

const getItemCount = (data: NodeDef<any>[]) => data.length;

export const NodeEntityFormComponent = memo((props: NodeComponentProps) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug(`rendering NodeDefEntityForm for ${NodeDefs.getName(nodeDef)}`);

  const listRef = useRef(null);

  const childrenDefs = DataEntrySelectors.useRecordEntityChildDefs({ nodeDef });

  useEffect(() => {
    const listEl: any = listRef.current;
    listEl?.scrollToOffset?.({ offset: 0, animated: false });
  }, [nodeDef, parentNodeUuid]);

  const renderItem = useCallback(
    ({ item: childDef }: ListRenderItemInfo<NodeDef<any>>) => (
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

import React, { useCallback, useEffect, useRef } from "react";
import { VirtualizedList } from "react-native";

import { NodeDef, NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";

import { NodeDefFormItem } from "../../../NodeDefFormItem";

import styles from "./styles";

type NodeEntityFormComponentProps = {
  nodeDef: any;
  parentNodeUuid?: string;
};

export const NodeEntityFormComponent = (props: NodeEntityFormComponentProps) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeDefEntityForm for ${NodeDefs.getName(nodeDef)}`);
  }

  const listRef = useRef(null);

  const childrenDefs = DataEntrySelectors.useRecordEntityChildDefs({ nodeDef });

  useEffect(() => {
    const listEl: any = listRef.current;
    listEl?.scrollToOffset?.({ offset: 0, animated: false });
  }, [nodeDef, parentNodeUuid]);

  const onFormItemFocus = useCallback(() => {}, []);

  return (
    <VirtualizedList
      ref={listRef}
      getItemCount={() => childrenDefs.length}
      getItem={(_data, index) => childrenDefs[index]!}
      initialNumToRender={10}
      keyExtractor={(childDef: NodeDef<any>) => childDef.uuid}
      persistentScrollbar
      renderItem={({ item: childDef }) => (
        <NodeDefFormItem
          key={childDef.uuid}
          nodeDef={childDef}
          parentNodeUuid={parentNodeUuid}
          onFocus={onFormItemFocus}
        />
      )}
      style={styles.container}
    />
    // <ScrollView
    //   nestedScrollEnabled
    //   style={styles.container}
    //   persistentScrollbar
    //   ref={listRef}
    // >
    //   <VView>
    //     {childrenDefs.map((childDef) => (
    //       <NodeDefFormItem
    //         key={childDef.uuid}
    //         nodeDef={childDef}
    //         parentNodeUuid={parentNodeUuid}
    //         onFocus={onFormItemFocus}
    //       />
    //     ))}
    //   </VView>
    // </ScrollView>
  );
};

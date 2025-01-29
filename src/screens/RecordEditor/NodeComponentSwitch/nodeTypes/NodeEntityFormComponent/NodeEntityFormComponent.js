import React, { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { VirtualizedList } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";

import { NodeDefFormItem } from "../../../NodeDefFormItem";

import styles from "./styles";

export const NodeEntityFormComponent = (props) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeDefEntityForm for ${NodeDefs.getName(nodeDef)}`);
  }

  const listRef = useRef(null);

  const childrenDefs = DataEntrySelectors.useRecordEntityChildDefs({ nodeDef });

  useEffect(() => {
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
  }, [nodeDef, parentNodeUuid]);

  const onFormItemFocus = useCallback((event) => {
    // event?.target
    //   ?.getNativeRef?.()
    //   ?.measureLayout(listRef.current, (_x, y, _width, _height) => {
    //     // listRef.current?.scrollTo({ y: y - 40, animated: true });
    //      listRef.current?.scrollToOffset({ offset: y - 40, animated: true });
    //   });
  }, []);

  return (
    <VirtualizedList
      ref={listRef}
      getItemCount={() => childrenDefs.length}
      getItem={(_data, index) => childrenDefs[index]}
      initialNumToRender={10}
      keyExtractor={(childDef) => childDef.uuid}
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

NodeEntityFormComponent.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  parentNodeUuid: PropTypes.string,
};

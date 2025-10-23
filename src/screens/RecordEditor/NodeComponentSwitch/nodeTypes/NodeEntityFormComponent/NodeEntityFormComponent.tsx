import React, { useCallback, useEffect, useRef } from "react";
import { VirtualizedList } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";

import { NodeDefFormItem } from "../../../NodeDefFormItem";

import styles from "./styles";

export const NodeEntityFormComponent = (props: any) => {
  const { nodeDef, parentNodeUuid } = props;

  if (__DEV__) {
    console.log(`rendering NodeDefEntityForm for ${NodeDefs.getName(nodeDef)}`);
  }

  const listRef = useRef(null);

  const childrenDefs = DataEntrySelectors.useRecordEntityChildDefs({ nodeDef });

  useEffect(() => {
    // @ts-expect-error TS(2339): Property 'scrollToOffset' does not exist on type '... Remove this comment to see the full error message
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
  }, [nodeDef, parentNodeUuid]);

  const onFormItemFocus = useCallback(() => {}, []);

  return (
    <VirtualizedList
      ref={listRef}
      getItemCount={() => childrenDefs.length}
      getItem={(_data, index) => childrenDefs[index]}
      initialNumToRender={10}
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      keyExtractor={(childDef) => childDef.uuid}
      persistentScrollbar
      renderItem={({ item: childDef }) => (
        <NodeDefFormItem
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
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

import React from "react";

import { CategoryItem } from "@openforis/arena-core";

import { HView, RadioButton, RadioButtonGroup } from "components";
import styles from "./styles";

type NodeCodeSingleRadioComponentProps = {
  editable?: boolean;
  itemLabelFunction: (item: CategoryItem) => string;
  items: CategoryItem[];
  onChange: (value: string) => void;
  value?: string;
};

export const NodeCodeSingleRadioComponent = (
  props: NodeCodeSingleRadioComponentProps,
) => {
  const { editable, itemLabelFunction, items, onChange, value } = props;

  return (
    <RadioButtonGroup onValueChange={onChange} value={value}>
      <HView style={styles.container}>
        {items.map((item) => (
          <RadioButton
            key={item.uuid}
            disabled={!editable}
            label={itemLabelFunction(item)}
            style={styles.item}
            value={item.uuid}
          />
        ))}
      </HView>
    </RadioButtonGroup>
  );
};

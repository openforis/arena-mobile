import React from "react";

import { HView, RadioButton, RadioButtonGroup } from "components";
import styles from "./styles";

type NodeCodeSingleRadioComponentProps = {
  editable?: boolean;
  itemLabelFunction: (item: any) => string;
  items: any[];
  onChange: (value: any) => void;
  value?: any;
};

export const NodeCodeSingleRadioComponent = (props: NodeCodeSingleRadioComponentProps) => {
  const { editable, itemLabelFunction, items, onChange, value } = props;

  return (
    <RadioButtonGroup onValueChange={onChange} value={value}>
      <HView style={styles.container}>
        {items.map((item: any) => <RadioButton
          key={item.uuid}
          disabled={!editable}
          label={itemLabelFunction(item)}
          style={styles.item}
          value={item.uuid}
        />)}
      </HView>
    </RadioButtonGroup>
  );
};

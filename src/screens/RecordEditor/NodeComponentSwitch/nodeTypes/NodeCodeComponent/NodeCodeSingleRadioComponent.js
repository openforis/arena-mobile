import React from "react";
import PropTypes from "prop-types";

import { HView, RadioButton, RadioButtonGroup } from "components";
import styles from "./styles";

export const NodeCodeSingleRadioComponent = (props) => {
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

NodeCodeSingleRadioComponent.propTypes = {
  editable: PropTypes.bool,
  itemLabelFunction: PropTypes.func,
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};

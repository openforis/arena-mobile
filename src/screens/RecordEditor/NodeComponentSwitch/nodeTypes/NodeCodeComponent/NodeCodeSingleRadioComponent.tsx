import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { HView, RadioButton, RadioButtonGroup } from "components";
import styles from "./styles";

export const NodeCodeSingleRadioComponent = (props: any) => {
  const { editable, itemLabelFunction, items, onChange, value } = props;

  return (
    // @ts-expect-error TS(2786): 'RadioButtonGroup' cannot be used as a JSX compone... Remove this comment to see the full error message
    <RadioButtonGroup onValueChange={onChange} value={value}>
      <HView style={styles.container}>
        // @ts-expect-error TS(2786): 'RadioButton' cannot be used as a JSX component.
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

NodeCodeSingleRadioComponent.propTypes = {
  editable: PropTypes.bool,
  itemLabelFunction: PropTypes.func,
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};

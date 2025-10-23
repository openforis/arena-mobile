import PropTypes from "prop-types";

import { Text } from "components";

import styles from "./styles";

export const NodeCodeReadOnlyValue = (props) => {
  const { itemLabelFunction, selectedItems } = props;

  const itemLabels = selectedItems?.map(itemLabelFunction).join("; ");

  return (
    <Text variant="bodyLarge" style={styles.item}>
      {itemLabels}
    </Text>
  );
};

NodeCodeReadOnlyValue.propTypes = {
  itemLabelFunction: PropTypes.func,
  selectedItems: PropTypes.array,
};

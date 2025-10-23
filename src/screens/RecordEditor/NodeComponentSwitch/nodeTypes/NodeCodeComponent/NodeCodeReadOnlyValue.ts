// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text } from "components";

import styles from "./styles";

export const NodeCodeReadOnlyValue = (props: any) => {
  const { itemLabelFunction, selectedItems } = props;

  const itemLabels = selectedItems?.map(itemLabelFunction).join("; ");

  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <Text variant="bodyLarge" style={styles.item}>
      {itemLabels}
    </Text>
  );
};

NodeCodeReadOnlyValue.propTypes = {
  itemLabelFunction: PropTypes.func,
  selectedItems: PropTypes.array,
};

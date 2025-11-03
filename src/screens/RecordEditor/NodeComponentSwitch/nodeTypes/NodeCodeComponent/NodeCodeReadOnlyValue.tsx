import { Text } from "components";

import styles from "./styles";

type NodeCodeReadOnlyValueProps = {
  itemLabelFunction: (item: any) => string;
  selectedItems?: any[];
};

export const NodeCodeReadOnlyValue = (props: NodeCodeReadOnlyValueProps) => {
  const { itemLabelFunction, selectedItems } = props;

  const itemLabels = selectedItems?.map(itemLabelFunction).join("; ");

  return (
    <Text variant="bodyLarge" style={styles.item}>
      {itemLabels}
    </Text>
  );
};

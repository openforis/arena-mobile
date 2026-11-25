import { ArenaCategoryItem } from "@openforis/arena-core";

import { Text } from "components";

import styles from "./styles";

type NodeCodeReadOnlyValueProps = {
  itemLabelFunction: (item: ArenaCategoryItem) => string;
  selectedItems?: ArenaCategoryItem[];
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

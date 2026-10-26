import { List, useTheme } from "react-native-paper";

import { useTranslation } from "localization";

import styles from "./styles";

type Props = {
  description: string;
  external?: boolean;
  icon: string;
  onPress: () => void;
  titleKey: string;
};

export const AboutListItem = (props: Props) => {
  const { description, external = false, icon, onPress, titleKey } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <List.Item
      title={t(titleKey)}
      description={description}
      descriptionNumberOfLines={2}
      onPress={onPress}
      style={styles.listItem}
      left={(leftProps) => (
        <List.Icon {...leftProps} icon={icon} color={theme.colors.primary} />
      )}
      right={(rightProps) => (
        <List.Icon
          {...rightProps}
          icon={external ? "open-in-new" : "chevron-right"}
        />
      )}
    />
  );
};

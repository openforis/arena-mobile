import { ListItem } from "components";
import { useTranslation } from "localization";
import { useAppTheme } from "theme";

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
  const theme = useAppTheme();

  return (
    <ListItem
      title={t(titleKey)}
      description={description}
      descriptionNumberOfLines={2}
      onPress={onPress}
      style={styles.listItem}
      leftIcon={icon}
      leftIconColor={theme.colors.primary}
      rightIcon={external ? "open-in-new" : "chevron-right"}
    />
  );
};

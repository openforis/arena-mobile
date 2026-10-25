import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

import { Icon, Markdown, ScrollView, Text, VView } from "components";
import { useTranslation } from "localization";
import { WhatsNew, WhatsNewItem } from "model";

type WhatsNewSlideProps = {
  item: WhatsNewItem;
};

export const WhatsNewSlide = (props: WhatsNewSlideProps) => {
  const { item } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <VView style={styles.container}>
      <VView style={styles.header}>
        <Icon color={theme.colors.primary} size={64} source={item.icon} />
        <Text
          style={styles.title}
          textKey={WhatsNew.getTitleKey(item)}
          variant="titleMedium"
        />
      </VView>
      <ScrollView style={styles.description}>
        <Markdown content={t(WhatsNew.getDescriptionKey(item))} />
      </ScrollView>
      <Text
        style={styles.version}
        textKey="whatsNew:since"
        textParams={{ version: item.version }}
        variant="labelSmall"
      />
    </VView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    textAlign: "center",
  },
  description: {
    flexGrow: 0,
    flexShrink: 1,
  },
  version: {
    alignSelf: "flex-end",
    opacity: 0.7,
  },
});

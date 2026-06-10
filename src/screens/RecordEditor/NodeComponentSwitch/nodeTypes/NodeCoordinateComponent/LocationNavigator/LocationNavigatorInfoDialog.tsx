import { StyleSheet } from "react-native";

import { Dialog, ScrollView, Text } from "components";

type Props = {
  onClose: () => void;
};

export const LocationNavigatorInfoDialog = ({ onClose }: Props) => (
  <Dialog
    title="dataEntry:coordinate.locationNavigatorInfo.title"
    onClose={onClose}
  >
    <ScrollView style={styles.scroll}>
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.description"
        variant="bodySmall"
        style={styles.description}
      />

      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.viewModesTitle"
        variant="titleSmall"
        style={styles.sectionTitle}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.compassTitle"
        variant="labelMedium"
        style={styles.itemTitle}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.compassDesc"
        variant="bodySmall"
        style={styles.itemDesc}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.radarTitle"
        variant="labelMedium"
        style={styles.itemTitle}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.radarDesc"
        variant="bodySmall"
        style={styles.itemDesc}
      />

      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.headingSourcesTitle"
        variant="titleSmall"
        style={[styles.sectionTitle, styles.sectionTitleSpaced]}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.sensorTitle"
        variant="labelMedium"
        style={styles.itemTitle}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.sensorDesc"
        variant="bodySmall"
        style={styles.itemDesc}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.gpsTitle"
        variant="labelMedium"
        style={styles.itemTitle}
      />
      <Text
        textKey="dataEntry:coordinate.locationNavigatorInfo.gpsDesc"
        variant="bodySmall"
        style={styles.itemDesc}
      />
    </ScrollView>
  </Dialog>
);

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 400,
  },
  description: {
    opacity: 0.8,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionTitleSpaced: {
    marginTop: 12,
  },
  itemTitle: {
    marginTop: 6,
    marginBottom: 2,
  },
  itemDesc: {
    opacity: 0.8,
  },
});

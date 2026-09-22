import { StyleSheet, useWindowDimensions } from "react-native";

import { Dialog, ScrollView, Text, VView } from "components";

type Props = {
  onClose: () => void;
};

export const LocationNavigatorInfoDialog = ({ onClose }: Props) => {
  const { height: windowHeight } = useWindowDimensions();

  return (
    <Dialog
      title="dataEntry:coordinate.locationNavigatorInfo.title"
      onClose={onClose}
      style={{ maxHeight: windowHeight * 0.9 }}
    >
      <VView style={styles.content}>
        <ScrollView style={styles.scroll} persistentScrollbar>
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
      </VView>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
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

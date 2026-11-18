import { View } from "react-native";

import { ChoiceItem } from "../ChoiceItem";
import { Modal } from "../Modal";
import { ScrollView } from "../ScrollView";
import { Text } from "../Text";
import { VView } from "../VView";
import styles from "./styles";
import { SurveyMapLayer, SurveyMapLayerType } from "./surveyMapLayers";

const groups = [
  {
    type: SurveyMapLayerType.areaOfInterest,
    titleKey: "recordsMap:layerGroup.areasOfInterest",
  },
  {
    type: SurveyMapLayerType.preloadedMapLayer,
    titleKey: "recordsMap:layerGroup.preloadedMapLayers",
  },
];

type Props = {
  layers: SurveyMapLayer[];
  onDismiss: () => void;
  onLayerToggle: (layerKey: string) => void;
  visibleLayerKeys: string[];
};

// lets the user choose the areas of interest and preloaded map layers of the survey shown on the map
export const SurveyMapLayersPanel = (props: Props) => {
  const { layers, onDismiss, onLayerToggle, visibleLayerKeys } = props;

  return (
    <Modal onDismiss={onDismiss} titleKey="recordsMap:layers">
      <ScrollView>
        {groups.map(({ type, titleKey }) => {
          const groupLayers = layers.filter((layer) => layer.type === type);
          if (groupLayers.length === 0) return null;
          return (
            <VView key={type} style={styles.surveyLayerGroup}>
              <Text
                style={styles.surveyLayerGroupTitle}
                textKey={titleKey}
                variant="titleSmall"
              />
              <VView style={styles.surveyLayerItems}>
                {groupLayers.map((layer) => (
                  <ChoiceItem
                    key={layer.key}
                    contentStyle={styles.surveyLayerItemContent}
                    multiple
                    onPress={() => onLayerToggle(layer.key)}
                    selected={visibleLayerKeys.includes(layer.key)}
                    style={styles.surveyLayerItem}
                  >
                    <View
                      style={[
                        styles.surveyLayerColor,
                        { backgroundColor: layer.color },
                      ]}
                    />
                    <Text style={styles.surveyLayerLabel} variant="bodyLarge">
                      {layer.label}
                    </Text>
                  </ChoiceItem>
                ))}
              </VView>
            </VView>
          );
        })}
      </ScrollView>
    </Modal>
  );
};

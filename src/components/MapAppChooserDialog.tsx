import React from "react";
import { StyleSheet } from "react-native";

import { useTranslation } from "localization";
import { MapApp, MapAppsService } from "service/mapApps";

import { ChoiceItem } from "./ChoiceItem";
import { Dialog } from "./Dialog";
import { Text } from "./Text";
import { VView } from "./VView";

type Props = {
  apps: MapApp[];
  onClose: () => void;
  onConfirm: () => void;
  onSelect: (choiceId: string) => void;
  relocationAllowed?: boolean;
  selectedId: string;
};

type MapAppChoiceItemProps = {
  description?: string;
  onPress: () => void;
  selected: boolean;
  title: string;
};

const styles = StyleSheet.create({
  options: { gap: 6 },
  itemTexts: { flex: 1 },
});

const MapAppChoiceItem = ({
  description,
  onPress,
  selected,
  title,
}: MapAppChoiceItemProps) => (
  <ChoiceItem onPress={onPress} selected={selected}>
    <VView style={styles.itemTexts}>
      <Text variant="bodyLarge">{title}</Text>
      {description && <Text variant="bodySmall">{description}</Text>}
    </VView>
  </ChoiceItem>
);

export const MapAppChooserDialog = (props: Props) => {
  const {
    apps,
    onClose,
    onConfirm,
    onSelect,
    relocationAllowed = false,
    selectedId,
  } = props;

  const { t } = useTranslation();
  const { inAppChoiceId, otherAppChoiceId } = MapAppsService;

  return (
    <Dialog
      actions={[
        { onPress: onConfirm, textKey: "dataEntry:coordinate.map.show" },
      ]}
      onClose={onClose}
      title="dataEntry:coordinate.map.chooserTitle"
    >
      <VView style={styles.options}>
        <MapAppChoiceItem
          description={t(
            relocationAllowed
              ? "dataEntry:coordinate.map.inAppDescriptionRelocatable"
              : "dataEntry:coordinate.map.inAppDescription",
          )}
          onPress={() => onSelect(inAppChoiceId)}
          selected={selectedId === inAppChoiceId}
          title={t("dataEntry:coordinate.map.inApp")}
        />
        {apps.map((app) => {
          const isOtherApp = app.id === otherAppChoiceId;
          return (
            <MapAppChoiceItem
              key={app.id}
              description={
                isOtherApp
                  ? t("dataEntry:coordinate.map.otherAppDescription")
                  : undefined
              }
              onPress={() => onSelect(app.id)}
              selected={selectedId === app.id}
              title={
                isOtherApp ? t("dataEntry:coordinate.map.otherApp") : app.name
              }
            />
          );
        })}
      </VView>
    </Dialog>
  );
};

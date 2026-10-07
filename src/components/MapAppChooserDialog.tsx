import React from "react";
import { StyleSheet } from "react-native";
import { RadioButton, TouchableRipple, useTheme } from "react-native-paper";

import { useTranslation } from "localization";
import { MapApp, MapAppsService } from "service/mapApps";

import { Dialog } from "./Dialog";
import { HView } from "./HView";
import { Text } from "./Text";
import { VView } from "./VView";

type Props = {
  apps: MapApp[];
  onClose: () => void;
  onConfirm: () => void;
  onSelect: (choiceId: string) => void;
  selectedId: string;
};

type ChoiceItemProps = {
  description?: string;
  onPress: () => void;
  selected: boolean;
  title: string;
};

const styles = StyleSheet.create({
  options: { gap: 6 },
  item: { borderRadius: 8, borderWidth: 1, paddingVertical: 4 },
  itemContent: { alignItems: "center" },
  itemTexts: { flex: 1 },
});

const ChoiceItem = ({ description, onPress, selected, title }: ChoiceItemProps) => {
  const { colors } = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      style={[
        styles.item,
        {
          borderColor: selected ? colors.primary : colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <HView style={styles.itemContent} transparent>
        <RadioButton
          onPress={onPress}
          status={selected ? "checked" : "unchecked"}
          value={title}
        />
        <VView style={styles.itemTexts} transparent>
          <Text variant="bodyLarge">{title}</Text>
          {description && <Text variant="bodySmall">{description}</Text>}
        </VView>
      </HView>
    </TouchableRipple>
  );
};

export const MapAppChooserDialog = (props: Props) => {
  const { apps, onClose, onConfirm, onSelect, selectedId } = props;

  const { t } = useTranslation();
  const { inAppChoiceId } = MapAppsService;

  return (
    <Dialog
      actions={[{ onPress: onConfirm, textKey: "dataEntry:coordinate.map.show" }]}
      onClose={onClose}
      title="dataEntry:coordinate.map.chooserTitle"
    >
      <VView style={styles.options}>
        <ChoiceItem
          description={t("dataEntry:coordinate.map.inAppDescription")}
          onPress={() => onSelect(inAppChoiceId)}
          selected={selectedId === inAppChoiceId}
          title={t("dataEntry:coordinate.map.inApp")}
        />
        {apps.map((app) => (
          <ChoiceItem
            key={app.id}
            onPress={() => onSelect(app.id)}
            selected={selectedId === app.id}
            title={app.name}
          />
        ))}
      </VView>
    </Dialog>
  );
};

import { useCallback, useMemo } from "react";
import { useNavigator } from "navigation/navigator";

import {
  Button,
  Card,
  DeleteIconButton,
  HView,
  ScreenView,
  Text,
  VView,
} from "components";
import { CustomMapLayer } from "model";
import { CustomMapLayersService } from "service";
import {
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { useAppTheme } from "theme";
import { log } from "utils";

import styles from "./styles";

const CustomMapLayerItem = ({
  layer,
  onDeletePress,
  onEditPress,
}: Readonly<{
  layer: CustomMapLayer;
  onDeletePress: (layer: CustomMapLayer) => Promise<void>;
  onEditPress: (layer: CustomMapLayer) => void;
}>) => {
  const theme = useAppTheme();
  const cardStyle = useMemo(
    () => [styles.layerCard, { borderColor: theme.colors.outline }],
    [theme],
  );
  return (
    <Card
      onPress={() => onEditPress(layer)}
      style={cardStyle}
      title={layer.name}
      titleVariant="titleLarge"
    >
      {/* the API key is not part of the url template (only its placeholder) */}
      <Text numberOfLines={2} style={styles.layerUrl} variant="bodySmall">
        {layer.urlTemplate}
      </Text>
      <HView style={styles.layerFooter}>
        <Text
          style={styles.layerMaxZoom}
          textKey="offlineMaps:customLayers.maxZoom"
          textParams={{ value: layer.maxZoom }}
        />
        <DeleteIconButton onPress={() => onDeletePress(layer)} />
      </HView>
    </Card>
  );
};

export const CustomMapLayersScreen = () => {
  log.debug("rendering CustomMapLayersScreen");

  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const settings = SettingsSelectors.useSettings();
  const { customMapLayers } = settings;

  const layers = useMemo(
    () =>
      [...(customMapLayers ?? [])].sort((layerA, layerB) =>
        layerA.name.localeCompare(layerB.name),
      ),
    [customMapLayers],
  );

  const onAddPress = useCallback(() => {
    navigator.navigateToCustomMapLayerEditor();
  }, [navigator]);

  const onEditPress = useCallback(
    (layer: CustomMapLayer) => {
      navigator.navigateToCustomMapLayerEditor({ layerId: layer.id });
    },
    [navigator],
  );

  const onDeletePress = useCallback(
    async (layer: CustomMapLayer) => {
      const offlineAreasCount = await CustomMapLayersService.countOfflineAreas(
        layer.id,
      );
      if (
        await confirm({
          messageKey:
            offlineAreasCount > 0
              ? "offlineMaps:customLayers.deleteConfirmWithOfflineAreas"
              : "offlineMaps:customLayers.deleteConfirm",
          messageParams: { name: layer.name, count: offlineAreasCount },
        })
      ) {
        await dispatch(SettingsActions.deleteCustomMapLayer(layer.id));
      }
    },
    [confirm, dispatch],
  );

  return (
    <ScreenView>
      <VView style={styles.container}>
        <Text
          style={styles.description}
          textKey="offlineMaps:customLayers.description"
        />
        <Button
          icon="plus"
          onPress={onAddPress}
          style={styles.addButton}
          textKey="offlineMaps:customLayers.add"
        />
        {layers.length === 0 && (
          <Text
            style={styles.emptyText}
            textKey="offlineMaps:customLayers.noLayers"
          />
        )}
        {layers.map((layer) => (
          <CustomMapLayerItem
            key={layer.id}
            layer={layer}
            onDeletePress={onDeletePress}
            onEditPress={onEditPress}
          />
        ))}
      </VView>
    </ScreenView>
  );
};

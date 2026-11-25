import { StyleProp, TextStyle } from "react-native";

import { HView, LoadingIcon, Text, VView } from "components";

import { ImportedMapPreviewState } from "./mapImportState";
import styles from "./styles";

type Props = {
  previewState: ImportedMapPreviewState;
  currentZoom: number | null;
  errorTextStyle: StyleProp<TextStyle>;
};

export const MapImportPreviewStatus = (props: Props) => {
  const { previewState, currentZoom, errorTextStyle } = props;
  const { preview, loading, errorDetails } = previewState;

  return (
    <VView style={styles.previewStatus}>
      {loading && (
        <HView style={styles.previewLoading}>
          <LoadingIcon size={16} />
          <Text
            textKey="importedMaps:import.preview.rendering"
            variant="bodySmall"
          />
        </HView>
      )}
      {preview && (
        <Text
          textKey="importedMaps:import.preview.lowResolution"
          textParams={{
            minZoom: preview.minZoom,
            maxZoom: preview.maxZoom,
          }}
          variant="bodySmall"
        />
      )}
      {currentZoom !== null && (
        <Text
          textKey="offlineMaps:areaEditor.currentZoom"
          textParams={{ value: currentZoom }}
          variant="bodySmall"
        />
      )}
      {errorDetails && (
        <Text
          style={errorTextStyle}
          textKey="importedMaps:import.preview.error"
          textParams={{ details: errorDetails }}
          variant="bodySmall"
        />
      )}
    </VView>
  );
};

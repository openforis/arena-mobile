import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { HView, OpenMapButton, Text, View, VView } from "components";
import { useTranslation } from "localization";
import { SurveySelectors } from "state";
import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

const styles = StyleSheet.create({
  grid: { flex: 1, gap: 6 },
  row: { alignItems: "baseline" },
  label: { minWidth: 50 },
  value: { flex: 1 },
  mapButton: { alignSelf: "center" },
});

export const CoordinateValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const { t } = useTranslation();

  const srsIndex = SurveySelectors.useCurrentSurveySrsIndex();
  const hasPoint = Objects.isNotEmpty(value?.x) && Objects.isNotEmpty(value?.y);

  const fields = useMemo(() => {
    const includedExtraFields = NodeDefs.getCoordinateAdditionalFields(nodeDef);
    return ["x", "y", "srs", ...includedExtraFields];
  }, [nodeDef]);

  return (
    <HView>
      <VView style={styles.grid}>
        {fields.map((fieldKey) => (
          <HView key={fieldKey} style={styles.row}>
            <Text style={styles.label} variant="labelLarge">
              {`${t(`dataEntry:coordinate.${fieldKey}`)}:`}
            </Text>
            <Text style={styles.value} variant="bodyLarge">
              {value[fieldKey]}
            </Text>
          </HView>
        ))}
      </VView>
      {hasPoint && (
        <View style={styles.mapButton} transparent>
          <OpenMapButton point={value} srsIndex={srsIndex} />
        </View>
      )}
    </HView>
  );
};

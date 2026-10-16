import { useState } from "react";
import { useRoute } from "@react-navigation/native";

import { ScreenView, SegmentedButtons, VView } from "components";
import { log } from "utils";

import { OfflineMapAreasTab } from "./OfflineMapAreasTab";
import { PdfMapsTab } from "./PdfMapsTab";
import styles from "./styles";

export enum OfflineMapsTab {
  areas = "areas",
  pdfMaps = "pdfMaps",
}

const tabButtons = [
  {
    icon: "vector-polygon",
    label: "offlineMaps:tabs.areas",
    value: OfflineMapsTab.areas,
  },
  {
    icon: "file-pdf-box",
    label: "offlineMaps:tabs.pdfMaps",
    value: OfflineMapsTab.pdfMaps,
  },
];

export const OfflineMapsScreen = () => {
  log.debug("rendering OfflineMapsScreen");

  const route = useRoute();
  const { initialTab } = (route.params ?? {}) as {
    initialTab?: OfflineMapsTab;
  };
  const [tab, setTab] = useState<OfflineMapsTab>(
    initialTab ?? OfflineMapsTab.areas,
  );

  return (
    <ScreenView>
      <VView style={styles.container}>
        <SegmentedButtons
          buttons={tabButtons}
          onChange={(value) => setTab(value as OfflineMapsTab)}
          value={tab}
        />
        {tab === OfflineMapsTab.areas ? <OfflineMapAreasTab /> : <PdfMapsTab />}
      </VView>
    </ScreenView>
  );
};

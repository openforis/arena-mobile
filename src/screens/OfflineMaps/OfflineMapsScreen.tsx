import { useState } from "react";
import { useScreenParams } from "navigation/navigator";
import { screenKeys } from "screens/screenKeys";

import { ScreenView, SegmentedButtons, VView } from "components";
import { log } from "utils";

import { OfflineMapAreasTab } from "./OfflineMapAreasTab";
import { ImportedMapsTab } from "./ImportedMapsTab";
import styles from "./styles";

export enum OfflineMapsTab {
  areas = "areas",
  importedMaps = "importedMaps",
}

const tabButtons = [
  {
    icon: "vector-polygon",
    label: "offlineMaps:tabs.areas",
    value: OfflineMapsTab.areas,
  },
  {
    icon: "file-pdf-box",
    label: "offlineMaps:tabs.importedMaps",
    value: OfflineMapsTab.importedMaps,
  },
];

export const OfflineMapsScreen = () => {
  log.debug("rendering OfflineMapsScreen");

  const { initialTab } = useScreenParams<screenKeys.offlineMaps>();
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
        {tab === OfflineMapsTab.areas ? (
          <OfflineMapAreasTab />
        ) : (
          <ImportedMapsTab />
        )}
      </VView>
    </ScreenView>
  );
};

import type { ImageSourcePropType } from "react-native";

// screenshots of the "What's new" items, by item id (static requires, as the bundler needs them)
export const whatsNewImagesById: Record<string, ImageSourcePropType[]> = {
  geoAttribute: [
    require("../../assets/whatsNew/geoAttribute-1.jpg"),
    require("../../assets/whatsNew/geoAttribute-2.jpg"),
    require("../../assets/whatsNew/geoAttribute-3.jpg"),
  ],
  offlineMaps: [
    require("../../assets/whatsNew/offlineMaps-1.jpg"),
    require("../../assets/whatsNew/offlineMaps-2.jpg"),
    require("../../assets/whatsNew/offlineMaps-3.jpg"),
    require("../../assets/whatsNew/offlineMaps-4.jpg"),
  ],
  recordsMap: [
    require("../../assets/whatsNew/recordsMap-1.jpg"),
    require("../../assets/whatsNew/recordsMap-2.jpg"),
    require("../../assets/whatsNew/recordsMap-3.jpg"),
    require("../../assets/whatsNew/recordsMap-4.jpg"),
  ],
  autoSync: [
    require("../../assets/whatsNew/autoSync-1.jpg"),
    require("../../assets/whatsNew/autoSync-2.jpg"),
  ],
  externalGps: [
    require("../../assets/whatsNew/externalGps-1.jpg"),
    require("../../assets/whatsNew/externalGps-2.jpg"),
    require("../../assets/whatsNew/externalGps-3.jpg"),
  ],
};

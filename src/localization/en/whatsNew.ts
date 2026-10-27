export default {
  title: "What's new",
  since: "Since version {{version}}",
  dontShowAgain: "Don't show these again",
  items: {
    geoAttribute: {
      title: "Geospatial attribute: draw polygons",
      description:
        "Surveys can now include **geospatial** attributes. In the form, tap **Draw polygon** and tap the map to add the points of the boundary (or, while walking along it, use **Add current location**), then press **Stop**.\n\nTap a point to select it and drag it, tap a midpoint to add a new point, then **Save**. The polygon can also be downloaded as GeoJSON.",
    },
    offlineMaps: {
      title: "Offline maps",
      description:
        "Open **Offline maps** from the main menu and use **Add area** to download the map of your area of interest before going to the field: it will be available even without an internet connection.\n\nIn the **PDF maps** tab you can also import georeferenced PDF maps: they are shown on top of the base map.",
    },
    recordsMap: {
      title: "Records on the map",
      description:
        "In the list of records, tap the **map** button at the top to see your data on the map: the sampling points (visited or not), the locations recorded in coordinate attributes and the position tracks.\n\nUse **Layers** to choose what to show, and tap a point to see its details and **Open** the record.",
    },
    autoSync: {
      title: "Automatic data sync",
      description:
        "Turn on **Auto sync** at the bottom of the list of records (or in **Settings**): when you are connected to the server, new and modified records are uploaded automatically in the background, without sending them manually.\n\nTap the sync status icon next to it to follow the progress or to **Sync now**.",
    },
    externalGps: {
      title: "External GPS devices",
      description:
        "Use a Bluetooth GPS receiver (e.g. Bad Elf) for more accurate coordinates: in **Settings > Location & GPS**, open **GPS source** and choose **Pair a new device…**.\n\nWith **Auto**, the external GPS is used whenever it is connected, otherwise the internal GPS of the device.",
    },
  },
};

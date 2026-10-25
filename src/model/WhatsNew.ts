// Features highlighted in the "What's new" dialog (a visual summary of CHANGELOG.md)
export type WhatsNewItem = {
  // used as i18n key (whatsNew:items.<id>.title/description) and to track the items seen by the user
  id: string;
  // release version (it must be listed in CHANGELOG.md)
  version: string;
  // Material Design icon name
  icon: string;
};

// newest first
const items: WhatsNewItem[] = [
  { id: "offlineMaps", version: "2.9.0", icon: "map-marker-down" },
  { id: "autoSync", version: "2.8.0", icon: "cloud-sync" },
  { id: "externalGps", version: "2.6.5", icon: "crosshairs-gps" },
];

// maximum number of items shown automatically (e.g. on the first app launch)
const maxAutoShownItems = 8;

const getTitleKey = (item: WhatsNewItem) => `whatsNew:items.${item.id}.title`;

const getDescriptionKey = (item: WhatsNewItem) =>
  `whatsNew:items.${item.id}.description`;

const getUnseenItems = (seenIds: string[]): WhatsNewItem[] => {
  const seenIdsSet = new Set(seenIds);
  return items
    .filter((item) => !seenIdsSet.has(item.id))
    .slice(0, maxAutoShownItems);
};

// ids no longer in the catalog are removed, to keep the preferences small
const mergeSeenIds = (
  seenIds: string[],
  itemsSeen: WhatsNewItem[],
): string[] => {
  const catalogIds = new Set(items.map((item) => item.id));
  const merged = new Set([...seenIds, ...itemsSeen.map((item) => item.id)]);
  return [...merged].filter((id) => catalogIds.has(id));
};

export const WhatsNew = {
  items,
  getTitleKey,
  getDescriptionKey,
  getUnseenItems,
  mergeSeenIds,
};

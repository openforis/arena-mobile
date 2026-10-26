import { useCallback, useEffect, useState } from "react";

import { WhatsNew, WhatsNewItem } from "model";
import { PreferencesService } from "service/preferencesService";
import { log } from "utils";

export const useWhatsNewUnseenItems = () => {
  const [seenIds, setSeenIds] = useState<string[] | null>(null);

  useEffect(() => {
    PreferencesService.getWhatsNewSeenIds()
      .then(setSeenIds)
      .catch((error) => {
        log.error("error fetching what's new seen items", error);
      });
  }, []);

  // empty until the seen items are fetched, to avoid showing them for a moment
  const unseenItems = seenIds ? WhatsNew.getUnseenItems(seenIds) : [];

  const markItemsAsSeen = useCallback(
    async (itemsSeen: WhatsNewItem[]) => {
      const seenIdsNext = WhatsNew.mergeSeenIds(seenIds ?? [], itemsSeen);
      await PreferencesService.setWhatsNewSeenIds(seenIdsNext);
      setSeenIds(seenIdsNext);
    },
    [seenIds],
  );

  return { unseenItems, markItemsAsSeen };
};

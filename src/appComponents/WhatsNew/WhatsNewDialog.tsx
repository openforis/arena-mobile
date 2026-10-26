import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import { Checkbox, Dialog } from "components";
import { WhatsNew, WhatsNewItem } from "model";

import { WhatsNewCarousel } from "./WhatsNewCarousel";
import { useWhatsNewUnseenItems } from "./useWhatsNewUnseenItems";

type WhatsNewDialogProps = {
  items: WhatsNewItem[];
  onClose: () => void;
  showDontShowAgain?: boolean;
  dontShowAgain?: boolean;
  onDontShowAgainChange?: () => void;
};

export const WhatsNewDialog = (props: WhatsNewDialogProps) => {
  const {
    items,
    onClose,
    showDontShowAgain = false,
    dontShowAgain = false,
    onDontShowAgainChange,
  } = props;

  const { height: windowHeight } = useWindowDimensions();

  return (
    <Dialog
      onClose={onClose}
      style={{ maxHeight: windowHeight * 0.9 }}
      title="whatsNew:title"
    >
      <WhatsNewCarousel items={items} />
      {showDontShowAgain && onDontShowAgainChange && (
        <Checkbox
          checked={dontShowAgain}
          label="whatsNew:dontShowAgain"
          onPress={onDontShowAgainChange}
          style={styles.dontShowAgain}
        />
      )}
    </Dialog>
  );
};

// shown automatically when there are items not dismissed yet:
// if closed without checking "Don't show these again", it will be shown again on the next app launch
export const WhatsNewUnseenItemsDialog = () => {
  const { unseenItems, markItemsAsSeen } = useWhatsNewUnseenItems();

  const [closed, setClosed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const onClose = useCallback(() => {
    setClosed(true);
    if (dontShowAgain) {
      void markItemsAsSeen(unseenItems);
    }
  }, [dontShowAgain, markItemsAsSeen, unseenItems]);

  const toggleDontShowAgain = useCallback(
    () => setDontShowAgain((prev) => !prev),
    [],
  );

  if (closed || unseenItems.length === 0) return null;

  return (
    <WhatsNewDialog
      dontShowAgain={dontShowAgain}
      items={unseenItems}
      onClose={onClose}
      onDontShowAgainChange={toggleDontShowAgain}
      showDontShowAgain
    />
  );
};

export const WhatsNewAllItemsDialog = ({ onClose }: { onClose: () => void }) => (
  <WhatsNewDialog items={WhatsNew.items} onClose={onClose} />
);

const styles = StyleSheet.create({
  dontShowAgain: {
    marginTop: 8,
  },
});

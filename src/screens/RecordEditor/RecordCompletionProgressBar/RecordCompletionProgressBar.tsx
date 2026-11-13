import { getCompletionColor, ProgressBar, Text, VView } from "components";
import { DataEntrySelectors } from "state";
import { useAppTheme } from "theme";

import styles from "./styles";

type Props = {
  compact?: boolean;
};

export const RecordCompletionProgressBar = (props: Props) => {
  const { compact = false } = props;
  const theme = useAppTheme();
  const completionPercent = DataEntrySelectors.useRecordCompletionPercent();

  const color = getCompletionColor(completionPercent);

  return (
    <VView
      style={[
        styles.completionContainer,
        compact
          ? styles.completionContainerCompact
          : { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      <ProgressBar
        color={color}
        progress={completionPercent / 100}
        style={styles.completionProgressBar}
      />
      <Text
        style={styles.completionText}
        textKey="dataEntry:recordCompletion.shortDescription"
        textParams={{ percent: completionPercent }}
        variant="bodySmall"
      />
    </VView>
  );
};

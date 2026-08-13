import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import { Records } from "@openforis/arena-core";

import { getCompletionColor, ProgressBar, Text, VView } from "components";
import { RecordUtils } from "model";
import { DataEntrySelectors, SurveySelectors } from "state";

import styles from "./styles";

type Props = {
  compact?: boolean;
};

export const RecordCompletionProgressBar = (props: Props) => {
  const { compact = false } = props;
  const theme = useTheme();
  const survey = SurveySelectors.useCurrentSurvey();
  const record = DataEntrySelectors.useRecord();

  const completionPercent = useMemo(() => {
    if (!survey || !record) return 0;
    const rootEntity = Records.getRoot(record);
    if (!rootEntity) return 0;
    const completionStats = Records.getEntityCompletionStats({
      survey,
      record,
      entity: rootEntity,
    });
    return RecordUtils.toCompletionPercent(completionStats);
  }, [survey, record]);

  const color = getCompletionColor(completionPercent);

  return (
    <VView
      style={[
        styles.completionContainer,
        compact
          ? styles.completionContainerCompact
          : { backgroundColor: theme.colors.elevation.level2 },
      ]}
      transparent
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

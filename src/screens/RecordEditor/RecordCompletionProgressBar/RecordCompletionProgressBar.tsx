import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import { Records } from "@openforis/arena-core";

import { getCompletionColor, ProgressBar, Text, VView } from "components";
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

  const completionPercent = useMemo(
    () =>
      survey && record
        ? Records.getRecordCompletionPercent({ survey, record })
        : 0,
    [survey, record]
  );

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
        textKey={
          compact
            ? "dataEntry:recordCompletion.shortDescription"
            : "dataEntry:recordCompletion.description"
        }
        textParams={{ percent: completionPercent }}
        variant="bodySmall"
      />
    </VView>
  );
};

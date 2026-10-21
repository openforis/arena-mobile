import { TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

import { Button, HView, Icon, Text, VView } from "components";

import styles from "./styles";

type AreaEditorStepProps = {
  children?: React.ReactNode;
  completed?: boolean;
  expanded: boolean;
  index: number;
  onNextPress?: () => void;
  onPress: () => void;
  summary?: string;
  summaryIsError?: boolean;
  titleKey: string;
};

export const AreaEditorStep = (props: AreaEditorStepProps) => {
  const {
    children,
    completed = false,
    expanded,
    index,
    onNextPress,
    onPress,
    summary,
    summaryIsError = false,
    titleKey,
  } = props;

  const theme = useTheme();

  const badgeBackgroundColor =
    expanded || completed ? theme.colors.primary : theme.colors.surfaceDisabled;

  return (
    <VView
      style={[
        styles.step,
        expanded && { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      <TouchableOpacity onPress={onPress}>
        <HView style={styles.stepHeader}>
          <VView
            style={[
              styles.stepBadge,
              { backgroundColor: badgeBackgroundColor },
            ]}
          >
            {completed && !expanded ? (
              <Icon color={theme.colors.onPrimary} size={14} source="check" />
            ) : (
              <Text
                style={[
                  styles.stepBadgeText,
                  { color: theme.colors.onPrimary },
                ]}
              >
                {String(index + 1)}
              </Text>
            )}
          </VView>
          <Text
            style={[styles.stepTitle, expanded && styles.stepTitleExpanded]}
            textKey={titleKey}
            variant="labelLarge"
          />
          {!expanded && !!summary && (
            <Text
              numberOfLines={1}
              style={[
                styles.stepSummary,
                summaryIsError && styles.estimateTextError,
              ]}
              variant="bodySmall"
            >
              {summary}
            </Text>
          )}
          <Icon source={expanded ? "chevron-up" : "chevron-down"} size={20} />
        </HView>
      </TouchableOpacity>
      {expanded && (
        <VView style={styles.stepContent}>
          {children}
          {onNextPress && (
            <HView style={styles.stepActions}>
              <Button
                compact
                icon="arrow-right"
                mode="contained-tonal"
                onPress={onNextPress}
                textKey="offlineMaps:areaEditor.steps.next"
              />
            </HView>
          )}
        </VView>
      )}
    </VView>
  );
};

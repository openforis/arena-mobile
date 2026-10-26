import { TouchableOpacity } from "react-native";

import { Button, HView, Icon, Text, VView } from "components";
import { useAppTheme } from "theme";

import styles from "./styles";

type AreaEditorStepProps = {
  // shown in the badge in place of the step number
  badgeText?: string;
  children?: React.ReactNode;
  // shows the expand/collapse icon (default: true when the step has content)
  collapsible?: boolean;
  completed?: boolean;
  expanded: boolean;
  index: number;
  onNextPress?: () => void;
  onPress: () => void;
  summary?: string;
  summaryIsError?: boolean;
  // when true, the step has no content: only the summary is shown, in place of the title
  summaryOnly?: boolean;
  // required unless summaryOnly is true
  titleKey?: string;
};

export const AreaEditorStep = (props: AreaEditorStepProps) => {
  const {
    badgeText,
    children,
    completed = false,
    expanded,
    index,
    onNextPress,
    onPress,
    summary,
    summaryIsError = false,
    summaryOnly = false,
    titleKey,
  } = props;
  const { collapsible = !summaryOnly } = props;

  const theme = useAppTheme();

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
            {completed && !expanded && !badgeText ? (
              <Icon color={theme.colors.onPrimary} size={14} source="check" />
            ) : (
              <Text
                style={[
                  styles.stepBadgeText,
                  { color: theme.colors.onPrimary },
                ]}
              >
                {badgeText ?? String(index + 1)}
              </Text>
            )}
          </VView>
          {!summaryOnly && (
            <Text
              style={[styles.stepTitle, expanded && styles.stepTitleExpanded]}
              textKey={titleKey}
              variant="labelLarge"
            />
          )}
          {(summaryOnly || !expanded) && !!summary && (
            <Text
              numberOfLines={1}
              style={[
                styles.stepSummary,
                summaryOnly && styles.stepSummaryOnly,
                summaryIsError && styles.estimateTextError,
              ]}
              variant={summaryOnly ? "labelLarge" : "bodySmall"}
            >
              {summary}
            </Text>
          )}
          {collapsible && (
            <Icon source={expanded ? "chevron-up" : "chevron-down"} size={20} />
          )}
        </HView>
      </TouchableOpacity>
      {expanded && !summaryOnly && (
        <VView style={styles.stepContent}>
          {children}
          {onNextPress && (
            <HView style={styles.stepActions}>
              <Button
                compact
                icon="arrow-right"
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

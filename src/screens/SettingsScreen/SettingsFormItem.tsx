import { useMemo } from "react";

import { Text, VView, View } from "components";
import { useIsTextDirectionRtl } from "localization";

import styles from "./styles";

type SettingsFormItemProps = {
  settingKey: string;
  labelKey?: string;
  labelParams?: Record<string, unknown>;
  descriptionKey?: string;
  descriptionParams?: Record<string, unknown>;
  direction?: string;
  children?: React.ReactNode;
};

export const SettingsFormItem = (props: SettingsFormItemProps) => {
  const {
    settingKey,
    labelKey,
    labelParams,
    descriptionKey,
    descriptionParams,
    direction = "vertical",
    children,
  } = props;

  const isRtl = useIsTextDirectionRtl();

  const style = useMemo(
    () =>
      direction === "vertical"
        ? styles.settingsFormItemVertical
        : [
            styles.settingsFormItemHorizontal,
            isRtl ? styles.settingsFormItemHorizontalRtl : undefined,
          ],
    [direction, isRtl],
  );

  return (
    <View key={settingKey} style={style}>
      <VView fullFlex>
        <Text
          textKey={labelKey}
          textParams={labelParams}
          variant="titleMedium"
        />
        {descriptionKey && (
          <Text
            style={styles.settingsItemDescription}
            textKey={descriptionKey}
            textParams={descriptionParams}
            variant="bodySmall"
          />
        )}
      </VView>
      {children}
    </View>
  );
};

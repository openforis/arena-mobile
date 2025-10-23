import { useMemo } from "react";
import PropTypes from "prop-types";

import { Text, VView, View } from "components";
import { useIsTextDirectionRtl } from "localization";

import styles from "./styles";

export const SettingsFormItem = (props) => {
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
            isRtl ? { flexDirection: "row-reverse" } : undefined,
          ],
    [direction, isRtl]
  );

  return (
    <View key={settingKey} style={style}>
      <VView style={{ flex: 1 }}>
        <Text textKey={labelKey} textParams={labelParams} />
        {descriptionKey && (
          <Text
            variant="labelMedium"
            textKey={descriptionKey}
            textParams={descriptionParams}
          />
        )}
      </VView>
      {children}
    </View>
  );
};

SettingsFormItem.propTypes = {
  settingKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string,
  labelParams: PropTypes.object,
  descriptionKey: PropTypes.string,
  descriptionParams: PropTypes.object,
  direction: PropTypes.string,
  children: PropTypes.node,
};

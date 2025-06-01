import { useMemo } from "react";
import PropTypes from "prop-types";

import { Text, VView, View } from "components";
import { i18n, useIsTextDirectionRtl } from "localization";

import styles from "./styles";

const determineTextKey = (...possibleKeys) =>
  possibleKeys.find((possibleKey) => possibleKey && i18n.exists(possibleKey));

export const SettingsFormItem = (props) => {
  const {
    settingKey,
    labelKey: labelKeyProp,
    labelParams,
    descriptionKey: descriptionKeyProp,
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

  const labelKey = determineTextKey(
    labelKeyProp,
    `settings:${settingKey}.label`,
    `settings:${settingKey}`
  );

  const descriptionKey = determineTextKey(
    descriptionKeyProp,
    `settings:${settingKey}.description`
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

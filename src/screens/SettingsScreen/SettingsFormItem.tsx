import { useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text, VView, View } from "components";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useIsTextDirectionRtl } from "localization";

import styles from "./styles";

export const SettingsFormItem = (props: any) => {
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

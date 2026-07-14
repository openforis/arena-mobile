import { Menu } from "react-native-paper";

import { useIsTextDirectionRtl, useTranslation } from "localization";

const styleRtl = { alignSelf: "flex-end" as const };
const textStyleRtl = { textAlign: "right" as const, marginRight: 6 };

type Props = {
  disabled?: boolean;
  icon?: string;
  onPress: () => void;
  title: string;
  titleIsI18nKey?: boolean;
  toggleMenu?: () => void;
};

export const MenuItem = (props: Props) => {
  const {
    disabled,
    icon,
    onPress,
    title,
    titleIsI18nKey = true,
    toggleMenu = undefined,
  } = props;

  const { t } = useTranslation();
  const isRtl = useIsTextDirectionRtl();

  return (
    <Menu.Item
      disabled={disabled}
      leadingIcon={isRtl ? undefined : icon}
      onPress={() => {
        toggleMenu?.();
        onPress();
      }}
      style={isRtl ? styleRtl : undefined}
      titleStyle={isRtl ? textStyleRtl : undefined}
      title={titleIsI18nKey ? t(title) : title}
      trailingIcon={isRtl ? icon : undefined}
    />
  );
};

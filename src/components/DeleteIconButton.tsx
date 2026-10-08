import { useTheme } from "react-native-paper";

import { IconButton, IconButtonProps } from "./IconButton";

export const DeleteIconButton = (props: IconButtonProps) => {
  const theme = useTheme();
  const { iconColor = theme.colors.error, ...otherProps } = props;

  return (
    <IconButton
      icon="trash-can-outline"
      iconColor={iconColor}
      {...otherProps}
    />
  );
};

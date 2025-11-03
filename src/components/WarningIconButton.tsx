import { IconButton, IconButtonProps } from "./IconButton";

export const WarningIconButton = (props: IconButtonProps) => {
  const { ...otherProps } = props;

  return <IconButton icon="alert" mode="contained" {...otherProps} />;
};

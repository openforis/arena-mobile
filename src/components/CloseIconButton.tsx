import { IconButton, IconButtonProps } from "./IconButton";

export const CloseIconButton = (props: IconButtonProps) => {
  const { ...otherProps } = props;

  return <IconButton icon="close" {...otherProps} />;
};

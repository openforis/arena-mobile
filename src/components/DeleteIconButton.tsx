import { IconButton, IconButtonProps } from "./IconButton";

export const DeleteIconButton = (props: IconButtonProps) => {
  const { ...otherProps } = props;

  return <IconButton icon="trash-can-outline" {...otherProps} />;
};

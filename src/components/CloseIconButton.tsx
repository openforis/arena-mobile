import { IconButton } from "./IconButton";

export const CloseIconButton = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <IconButton icon="close" {...otherProps}>
      {children}
    </IconButton>
  );
};

CloseIconButton.propTypes = IconButton.propTypes;

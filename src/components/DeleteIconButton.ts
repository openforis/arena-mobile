import { IconButton } from "./IconButton";

export const DeleteIconButton = (props) => {
  const { children, ...otherProps } = props;

  return (
    <IconButton icon="trash-can-outline" {...otherProps}>
      {children}
    </IconButton>
  );
};

DeleteIconButton.propTypes = IconButton.propTypes;

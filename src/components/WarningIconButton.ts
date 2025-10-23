import { IconButton } from "./IconButton";

export const WarningIconButton = (props) => {
  const { children, ...otherProps } = props;

  return (
    <IconButton icon="alert" mode="contained" {...otherProps}>
      {children}
    </IconButton>
  );
};

WarningIconButton.propTypes = IconButton.propTypes;

import { IconButton } from "./IconButton";

export const WarningIconButton = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <IconButton icon="alert" mode="contained" {...otherProps}>
      {children}
    </IconButton>
  );
};

WarningIconButton.propTypes = IconButton.propTypes;

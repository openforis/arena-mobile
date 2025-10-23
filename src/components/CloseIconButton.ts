import { IconButton } from "./IconButton";

export const CloseIconButton = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <IconButton icon="close" {...otherProps}>
      {children}
    </IconButton>
  );
};

CloseIconButton.propTypes = IconButton.propTypes;

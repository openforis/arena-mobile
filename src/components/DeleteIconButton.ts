import { IconButton } from "./IconButton";

export const DeleteIconButton = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <IconButton icon="trash-can-outline" {...otherProps}>
      {children}
    </IconButton>
  );
};

DeleteIconButton.propTypes = IconButton.propTypes;

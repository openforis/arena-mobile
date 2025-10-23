import { Image as RNImage } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useImageFile } from "hooks";

export const Image = (props: any) => {
  const { defaultExtension = "jpg", source: sourceProp, style } = props;

  const { uri: sourcePropUri } = sourceProp ?? {};

  const sourceUri = useImageFile(sourcePropUri, defaultExtension);

  if (!sourceUri) return null;
  // @ts-expect-error TS(7027): Unreachable code detected.
  return <RNImage source={{ uri: sourceUri }} style={style} />;
};

Image.propTypes = {
  defaultExtension: PropTypes.string,
  source: PropTypes.object.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

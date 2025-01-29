import { Image as RNImage } from "react-native";
import PropTypes from "prop-types";

import { useImageFile } from "hooks";

export const Image = (props) => {
  const { defaultExtension = "jpg", source: sourceProp, style } = props;

  const { uri: sourcePropUri } = sourceProp ?? {};

  const sourceUri = useImageFile(sourcePropUri, defaultExtension);

  if (!sourceUri) return null;
  return <RNImage source={{ uri: sourceUri }} style={style} />;
};

Image.propTypes = {
  defaultExtension: PropTypes.string,
  source: PropTypes.object.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

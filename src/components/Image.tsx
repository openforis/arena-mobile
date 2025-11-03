import { Image as RNImage, StyleProp, ImageStyle } from "react-native";

import { useImageFile } from "hooks";

type Props = {
  defaultExtension?: string;
  source: any;
  style?: StyleProp<ImageStyle>;
};

export const Image = (props: Props) => {
  const { defaultExtension = "jpg", source: sourceProp, style } = props;

  const { uri: sourcePropUri } = sourceProp ?? {};

  const sourceUri = useImageFile(sourcePropUri, defaultExtension);

  if (!sourceUri) return null;
  return <RNImage source={{ uri: sourceUri }} style={style} />;
};

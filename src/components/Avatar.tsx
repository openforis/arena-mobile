import { Avatar as RNPAvatar } from "react-native-paper";

type Props = {
  // shown when neither imageUri nor label are specified
  icon?: string;
  imageUri?: string;
  label?: string;
  size?: number;
};

export const Avatar = (props: Props) => {
  const { icon = "account", imageUri, label, size } = props;
  if (imageUri)
    return <RNPAvatar.Image source={{ uri: imageUri }} size={size} />;
  if (label) return <RNPAvatar.Text label={label} size={size} />;
  return <RNPAvatar.Icon icon={icon} size={size} />;
};

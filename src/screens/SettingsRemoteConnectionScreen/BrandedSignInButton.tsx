import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { Text } from "components";
import { useEffectiveTheme } from "hooks";

type BrandColors = { background: string; border: string; text: string };

type Brand = {
  label: string;
  Logo: () => React.JSX.Element;
  colors: { light: BrandColors; dark: BrandColors };
};

const logoSize = 20;

const GoogleLogo = () => (
  <Svg height={logoSize} viewBox="0 0 48 48" width={logoSize}>
    <Path
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      fill="#EA4335"
    />
    <Path
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      fill="#4285F4"
    />
    <Path
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      fill="#FBBC05"
    />
    <Path
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      fill="#34A853"
    />
  </Svg>
);

const MicrosoftLogo = () => (
  <Svg height={logoSize} viewBox="0 0 21 21" width={logoSize}>
    <Rect fill="#F25022" height={10} width={10} x={0} y={0} />
    <Rect fill="#7FBA00" height={10} width={10} x={11} y={0} />
    <Rect fill="#00A4EF" height={10} width={10} x={0} y={11} />
    <Rect fill="#FFB900" height={10} width={10} x={11} y={11} />
  </Svg>
);

// sign-in branding guidelines of the providers: brand colors, not theme tokens; logos must not be recolored
const brandByProviderType: Record<string, Brand> = {
  google: {
    label: "Google",
    Logo: GoogleLogo,
    colors: {
      light: { background: "#FFFFFF", border: "#747775", text: "#1F1F1F" },
      dark: { background: "#131314", border: "#8E918F", text: "#E3E3E3" },
    },
  },
  microsoft: {
    label: "Microsoft",
    Logo: MicrosoftLogo,
    colors: {
      light: { background: "#FFFFFF", border: "#8C8C8C", text: "#5E5E5E" },
      dark: { background: "#2F2F2F", border: "#2F2F2F", text: "#FFFFFF" },
    },
  },
};

export const isBrandedProviderType = (type: string): boolean =>
  type in brandByProviderType;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  disabled: { opacity: 0.38 },
  pressed: { opacity: 0.88 },
  text: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
});

type Props = {
  disabled: boolean;
  onPress: () => void;
  providerType: string;
  testID?: string;
};

export const BrandedSignInButton = ({
  disabled,
  onPress,
  providerType,
  testID,
}: Props) => {
  const theme = useEffectiveTheme();
  const brand = brandByProviderType[providerType];
  if (!brand) return null;
  const { label, Logo } = brand;
  const colors = theme.dark ? brand.colors.dark : brand.colors.light;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      testID={testID}
    >
      <View>
        <Logo />
      </View>
      <Text
        style={[styles.text, { color: colors.text }]}
        textKey="settingsRemoteConnection:signInWith"
        textParams={{ provider: label }}
      />
    </Pressable>
  );
};

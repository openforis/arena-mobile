import { StyleSheet } from "react-native";

import { AppLogo } from "appComponents/AppLogo";
import { HView, VView } from "components";
import { useEffectiveTheme } from "hooks";

// darker than the dark theme's primary color, to keep the white text readable
const backgroundColorDark = "rgb(38, 92, 125)";

export const bannerTextColor = "white";
export const bannerSecondaryTextColor = "rgba(255, 255, 255, 0.8)";

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: { alignItems: "center", gap: 14, paddingHorizontal: 4 },
  logoContainer: { backgroundColor: "white", borderRadius: 26, padding: 4 },
  logo: { width: 44, height: 44 },
  headerContent: { flex: 1 },
});

type Props = {
  children?: React.ReactNode;
  header?: React.ReactNode;
};

export const HomeBanner = ({ children, header }: Props) => {
  const theme = useEffectiveTheme();
  const backgroundColor = theme.dark
    ? backgroundColorDark
    : theme.colors.primary;
  return (
    <VView style={[styles.container, { backgroundColor }]}>
      <HView style={styles.header}>
        <VView style={styles.logoContainer}>
          <AppLogo style={styles.logo} />
        </VView>
        <VView style={styles.headerContent}>{header}</VView>
      </HView>
      {children}
    </VView>
  );
};

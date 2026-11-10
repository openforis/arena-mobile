import { useState } from "react";
import {
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";

import { useEffectiveTheme } from "hooks/useEffectiveTheme";
import { useTranslation } from "localization";

import { Text } from "./Text";

const nonDigitsRegExp = /\D/g;

const styles = StyleSheet.create({
  container: { alignSelf: "stretch" },
  // digits always left to right, also with RTL languages
  boxes: {
    direction: "ltr",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  box: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 1,
    height: 56,
    justifyContent: "center",
    width: 48,
  },
  boxActive: { borderWidth: 2 },
  // almost transparent but not hidden: it still gets taps, paste and autofill
  input: { ...StyleSheet.absoluteFill, fontSize: 1, opacity: 0.01 },
});

type Props = {
  autoFocus?: boolean;
  error?: boolean;
  label: string;
  length?: number;
  onChange: (value: string) => void;
  testID?: string;
  value: string;
};

// one box for each digit of the code; typed, pasted or autofilled codes go to a single text input
export const VerificationCodeInput = ({
  autoFocus = false,
  error = false,
  label,
  length = 6,
  onChange,
  testID,
  value,
}: Props) => {
  const { t } = useTranslation();
  const theme = useEffectiveTheme();
  const [focused, setFocused] = useState(autoFocus);

  const getBorderColor = (active: boolean) => {
    if (error) return theme.colors.error;
    return active ? theme.colors.primary : theme.colors.outline;
  };

  return (
    <View style={styles.container}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.boxes}
      >
        {Array.from({ length }, (_, index) => {
          const active = focused && index === value.length;
          return (
            <View
              key={index}
              style={[
                styles.box,
                active && styles.boxActive,
                { borderColor: getBorderColor(active) },
              ]}
            >
              <Text variant="headlineSmall">{value[index] ?? ""}</Text>
            </View>
          );
        })}
      </View>
      <RNTextInput
        accessibilityLabel={t(label)}
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        autoFocus={autoFocus}
        caretHidden
        keyboardType="number-pad"
        onBlur={() => setFocused(false)}
        onChangeText={(text) =>
          onChange(text.replaceAll(nonDigitsRegExp, "").slice(0, length))
        }
        onFocus={() => setFocused(true)}
        style={styles.input}
        testID={testID}
        textContentType="oneTimeCode"
        value={value}
      />
    </View>
  );
};

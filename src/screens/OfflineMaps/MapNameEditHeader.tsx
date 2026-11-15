import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

import { HView, IconButton, Text, TextInput, VView } from "components";
import { useAppTheme } from "theme";

// header of a map viewer: editable map name with save button, followed by the children
export const MapNameEditHeader = ({
  canSave,
  children,
  label,
  name,
  nameErrorKey,
  onNameChange,
  onSavePress,
}: Readonly<{
  canSave: boolean;
  children?: React.ReactNode;
  label: string;
  name: string;
  nameErrorKey: string | null | undefined;
  onNameChange: (name: string) => void;
  onSavePress: () => Promise<void>;
}>) => {
  const theme = useAppTheme();
  const nameErrorStyle = useMemo(
    () => ({ color: theme.colors.error }),
    [theme],
  );
  return (
    <VView style={styles.header}>
      <HView style={styles.nameRow}>
        <TextInput
          error={!!nameErrorKey}
          label={label}
          onChange={onNameChange}
          style={styles.nameInput}
          value={name}
        />
        <IconButton
          disabled={!canSave}
          icon="content-save"
          onPress={onSavePress}
        />
      </HView>
      {nameErrorKey && <Text style={nameErrorStyle} textKey={nameErrorKey} />}
      {children}
    </VView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  nameRow: {
    alignItems: "center",
  },
  nameInput: {
    flex: 1,
  },
});

import { StyleSheet, View } from "react-native";

const INDENT_SIZE = 8;

type TreeLinesProps = {
  level: number;
};

export const TreeLines = ({ level }: TreeLinesProps) => {
  if (level === 0) return null;

  return (
    <>
      {Array.from({ length: level }, (_, i) => (
        <View key={i} style={styles.block} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  block: {
    width: INDENT_SIZE,
  },
});

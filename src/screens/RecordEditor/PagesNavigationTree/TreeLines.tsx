import { StyleSheet, View } from "react-native";

const INITIAL_INDENT = 0;
const INDENT_SIZE = 20;

type TreeLinesProps = {
  level: number;
};

export const TreeLines = ({ level }: TreeLinesProps) => {
  if (level === 0) return null;

  return (
    <>
      <View style={styles.initialIndent} />
      {Array.from({ length: level - 1 }, (_, i) => (
        <View key={i} style={styles.block} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  initialIndent: {
    width: INITIAL_INDENT,
  },
  block: {
    width: INDENT_SIZE,
  },
});

import { useMemo } from "react";
import { StyleSheet } from "react-native";
import RNMarkdown from "react-native-markdown-display";
import { useTheme } from "react-native-paper";

export type MarkdownStyle = StyleSheet.NamedStyles<any>;

type MarkdownProps = {
  content: string;
  style?: MarkdownStyle;
};

export const Markdown = (props: MarkdownProps) => {
  const { content, style: styleProp } = props;

  const theme = useTheme();

  const style = useMemo(() => {
    return {
      body: {
        color: theme.colors.onBackground,
      },
      ...styleProp,
    } as MarkdownStyle;
  }, [styleProp, theme]);

  return <RNMarkdown style={style}>{content ?? ""}</RNMarkdown>;
};

import { useMemo } from "react";
import RNMarkdown, {
  MarkdownStyleMap,
} from "@ronradtke/react-native-markdown-display";
import { useTheme } from "react-native-paper";

export type MarkdownStyle = MarkdownStyleMap;

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

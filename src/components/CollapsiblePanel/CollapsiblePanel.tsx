import { useCallback, useState } from "react";
import Collapsible from "react-native-collapsible";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

import { HView } from "../HView";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { VView } from "../VView";

import { useStyles } from "./styles";

type CollapsiblePanelProps = {
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerContent?: React.ReactNode;
  headerKey?: string;
  headerParams?: any;
};

export const CollapsiblePanel = (props: CollapsiblePanelProps) => {
  const {
    children,
    containerStyle = null,
    contentStyle = null,
    headerContent,
    headerKey,
    headerParams,
  } = props;

  const styles = useStyles();

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = useCallback(
    () => setCollapsed((collapsedPrev) => !collapsedPrev),
    [],
  );

  const headerCollapsingIconSource = collapsed ? "chevron-down" : "chevron-up";

  return (
    <VView style={[styles.container, containerStyle]}>
      <TouchableOpacity onPress={toggleCollapsed}>
        <HView style={styles.headerContainer}>
          {headerContent}
          {headerKey && (
            <Text
              style={styles.headerText}
              textKey={headerKey}
              textParams={headerParams}
            />
          )}
          <Icon source={headerCollapsingIconSource} size={30} />
        </HView>
      </TouchableOpacity>

      <Collapsible
        collapsed={collapsed}
        renderChildrenCollapsed={false}
        style={[styles.collapsibleContainer, contentStyle]}
      >
        {children}
      </Collapsible>
    </VView>
  );
};

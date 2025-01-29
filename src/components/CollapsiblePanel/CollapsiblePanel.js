import { useCallback, useState } from "react";
import Collapsible from "react-native-collapsible";
import { TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import { HView } from "../HView";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { VView } from "../VView";

import { useStyles } from "./styles";

export const CollapsiblePanel = (props) => {
  const { children, containerStyle, headerContent, headerKey, headerParams } =
    props;

  const styles = useStyles();

  const [collapsed, setCollapsed] = useState(true);

  const onHeaderPress = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed]
  );

  const headerCollapsingIconSource = collapsed ? "chevron-down" : "chevron-up";

  return (
    <VView style={[styles.container, containerStyle]}>
      <TouchableOpacity onPress={onHeaderPress}>
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
        style={styles.collapsibleContainer}
      >
        {children}
      </Collapsible>
    </VView>
  );
};

CollapsiblePanel.propTypes = {
  children: PropTypes.node,
  containerStyle: PropTypes.object,
  headerContent: PropTypes.node,
  headerKey: PropTypes.string,
  headerParams: PropTypes.object,
};

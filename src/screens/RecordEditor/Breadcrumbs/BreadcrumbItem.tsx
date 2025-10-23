import { useCallback, useMemo } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Button, HView, Icon } from "components";
import { useIsTextDirectionRtl } from "localization";

import styles from "./styles";

const Separator = () => {
  const irRtl = useIsTextDirectionRtl();
  const iconSource = irRtl ? "less-than" : "greater-than";
  return <Icon source={iconSource} />;
};

export const BreadcrumbItem = (props: any) => {
  const { isLastItem = false, item, onItemPress: onItemPressProp } = props;

  const irRtl = useIsTextDirectionRtl();

  const onItemPress = useCallback(
    () => onItemPressProp(item),
    [item, onItemPressProp]
  );

  const style = useMemo(() => {
    const _style = [styles.item];
    if (irRtl) {
      // @ts-expect-error TS(2345): Argument of type 'ViewStyle | TextStyle | ImageSty... Remove this comment to see the full error message
      _style.push(styles.itemRtl);
    }
    return _style;
  }, [irRtl]);

  return (
    <HView style={style} transparent>
      <Button
        color={isLastItem ? "primary" : "secondary"}
        compact
        onPress={onItemPress}
        style={styles.itemButton}
        textKey={item.name}
      />
      {!isLastItem && <Separator />}
    </HView>
  );
};

BreadcrumbItem.propTypes = {
  isLastItem: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onItemPress: PropTypes.func.isRequired,
};

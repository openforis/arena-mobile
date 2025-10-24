import { useCallback, useMemo } from "react";
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
    const _style: any[] = [styles.item];
    if (irRtl) {
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

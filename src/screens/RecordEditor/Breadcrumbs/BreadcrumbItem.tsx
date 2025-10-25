import { useCallback, useMemo } from "react";

import { Button, HView, Icon } from "components";
import { useIsTextDirectionRtl } from "localization";

import styles from "./styles";

const Separator = () => {
  const irRtl = useIsTextDirectionRtl();
  const iconSource = irRtl ? "less-than" : "greater-than";
  return <Icon source={iconSource} />;
};

type Props = {
  isLastItem?: boolean;
  item: any;
  onItemPress: (item: any) => void;
};

export const BreadcrumbItem = (props: Props) => {
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

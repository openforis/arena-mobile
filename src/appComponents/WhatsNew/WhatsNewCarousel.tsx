import { useCallback } from "react";

import { Carousel } from "components";
import { WhatsNewItem } from "model";

import { WhatsNewSlide } from "./WhatsNewSlide";

const keyExtractor = (item: WhatsNewItem) => item.id;

type WhatsNewCarouselProps = {
  items: WhatsNewItem[];
};

export const WhatsNewCarousel = (props: WhatsNewCarouselProps) => {
  const { items } = props;

  const renderItem = useCallback(
    (item: WhatsNewItem) => <WhatsNewSlide item={item} />,
    [],
  );

  return (
    <Carousel
      items={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

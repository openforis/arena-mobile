import { useCallback } from "react";

import { Carousel } from "components";
import { WhatsNewItem } from "model";

import { WhatsNewSlide } from "./WhatsNewSlide";

type WhatsNewCarouselProps = {
  items: WhatsNewItem[];
};

export const WhatsNewCarousel = (props: WhatsNewCarouselProps) => {
  const { items } = props;

  const renderItem = useCallback(
    (item: WhatsNewItem) => <WhatsNewSlide key={item.id} item={item} />,
    [],
  );

  return <Carousel items={items} renderItem={renderItem} />;
};

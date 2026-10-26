import { useMemo, useState } from "react";
import {
  I18nManager,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
// gesture handler ScrollView: scrolls vertically inside the carousel swipe gesture
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import { Extrapolation, interpolate } from "react-native-reanimated";
import { CarouselItemAnimation } from "react-native-reanimated-carousel";

import {
  Carousel,
  Dialog,
  HView,
  Icon,
  Markdown,
  Text,
  VView,
} from "components";
import { useTranslation } from "localization";
import { WhatsNew, WhatsNewItem } from "model";

// see Dialog styles (overlay padding, max width) and RN Paper Dialog.Content padding
const dialogHorizontalMargin = 56;
const dialogMaxWidth = 480;
const dialogContentHorizontalPadding = 48;

// space between the current image and the (smaller) adjacent ones
const imagesGap = 12;
const adjacentImageScale = 0.8;
// evaluated here: I18nManager isn't available in the worklet below
const directionSign = I18nManager.isRTL ? -1 : 1;

// "cover flow": the adjacent images are shown smaller and faded beside the current one
const createImagesAnimation =
  (distance: number): CarouselItemAnimation =>
  (relativeProgress) => {
    "worklet";
    const absProgress = Math.abs(relativeProgress);
    return {
      opacity: interpolate(
        absProgress,
        [0, 1, 2],
        [1, 0.5, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateX: relativeProgress * distance * directionSign },
        {
          scale: interpolate(
            absProgress,
            [0, 1],
            [1, adjacentImageScale],
            Extrapolation.CLAMP,
          ),
        },
      ],
      zIndex: Math.round(
        interpolate(absProgress, [0, 1], [10, 0], Extrapolation.CLAMP),
      ),
    };
  };

const getAspectRatio = (image: ImageSourcePropType) => {
  const { width, height } = Image.resolveAssetSource(image) ?? {};
  return width && height ? width / height : 9 / 19.5;
};

type WhatsNewSlideProps = {
  item: WhatsNewItem;
};

export const WhatsNewSlide = (props: WhatsNewSlideProps) => {
  const { item } = props;
  const { images = [] } = item;

  const { t } = useTranslation();
  const theme = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [enlargedImage, setEnlargedImage] =
    useState<ImageSourcePropType | null>(null);
  const [imagesWidth, setImagesWidth] = useState(0);

  const title = t(WhatsNew.getTitleKey(item));
  // limited so that the description is still visible in landscape orientation
  const imageMaxHeight = windowHeight * 0.3;

  const getImageSize = (image: ImageSourcePropType) => {
    const aspectRatio = getAspectRatio(image);
    const width = Math.min(imagesWidth, imageMaxHeight * aspectRatio);
    return { width, height: width / aspectRatio };
  };

  const imageSizes = images.map(getImageSize);
  // same height for all the images, so the slide doesn't change size when going through them
  const imagesHeight = Math.max(0, ...imageSizes.map((size) => size.height));
  const imagesMaxWidth = Math.max(0, ...imageSizes.map((size) => size.width));

  // adjacent images placed right beside the current one
  const imagesAnimationDistance = Math.min(
    imagesWidth,
    (imagesMaxWidth * (1 + adjacentImageScale)) / 2 + imagesGap,
  );
  const imagesAnimation = useMemo(
    () => createImagesAnimation(imagesAnimationDistance),
    [imagesAnimationDistance],
  );

  const renderImage = (image: ImageSourcePropType) => (
    <View style={styles.imageContainer}>
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="imagebutton"
        onPress={() => setEnlargedImage(image)}
      >
        <Image
          resizeMode="contain"
          source={image}
          style={[
            styles.image,
            getImageSize(image),
            { borderColor: theme.colors.outlineVariant },
          ]}
        />
      </Pressable>
    </View>
  );

  const getEnlargedImageSize = (image: ImageSourcePropType) => {
    const aspectRatio = getAspectRatio(image);
    const maxWidth =
      Math.min(windowWidth - dialogHorizontalMargin, dialogMaxWidth) -
      dialogContentHorizontalPadding;
    const width = Math.min(maxWidth, windowHeight * 0.7 * aspectRatio);
    return { width, height: width / aspectRatio };
  };

  return (
    <VView style={styles.container}>
      <HView style={styles.header}>
        <Icon color={theme.colors.primary} size={32} source={item.icon} />
        <Text style={styles.title} variant="titleMedium">
          {title}
        </Text>
      </HView>
      {images.length > 0 && (
        <View
          onLayout={(event) => setImagesWidth(event.nativeEvent.layout.width)}
        >
          {imagesWidth > 0 && (
            <Carousel
              compact
              height={imagesHeight}
              itemAnimation={imagesAnimation}
              items={images}
              renderItem={renderImage}
            />
          )}
        </View>
      )}
      <ScrollView style={styles.description}>
        <Markdown content={t(WhatsNew.getDescriptionKey(item))} />
      </ScrollView>
      <Text
        style={styles.version}
        textKey="whatsNew:since"
        textParams={{ version: item.version }}
        variant="labelSmall"
      />
      {enlargedImage && (
        <Dialog
          onClose={() => setEnlargedImage(null)}
          style={{ maxHeight: windowHeight * 0.9 }}
          title={title}
        >
          <Image
            resizeMode="contain"
            source={enlargedImage}
            style={[styles.enlargedImage, getEnlargedImageSize(enlargedImage)]}
          />
        </Dialog>
      )}
    </VView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  image: {
    borderRadius: 6,
    borderWidth: 1,
  },
  enlargedImage: {
    alignSelf: "center",
  },
  description: {
    flex: 1,
  },
  version: {
    alignSelf: "flex-end",
    opacity: 0.7,
  },
});

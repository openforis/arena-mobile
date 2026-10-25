import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import {
  Dialog,
  HView,
  Icon,
  Markdown,
  ScrollView,
  Text,
  VView,
} from "components";
import { useTranslation } from "localization";
import { WhatsNew, WhatsNewItem } from "model";

const imagesGap = 8;
// see Dialog styles (overlay padding, max width) and RN Paper Dialog.Content padding
const dialogHorizontalMargin = 56;
const dialogMaxWidth = 480;
const dialogContentHorizontalPadding = 48;

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
  const [imagesRowWidth, setImagesRowWidth] = useState(0);

  const title = t(WhatsNew.getTitleKey(item));
  // limited so that the description is still visible in landscape orientation
  const imageMaxHeight = windowHeight * 0.32;

  const getImageSize = (image: ImageSourcePropType) => {
    const aspectRatio = getAspectRatio(image);
    const maxWidth =
      (imagesRowWidth - imagesGap * (images.length - 1)) / images.length;
    const width = Math.min(maxWidth, imageMaxHeight * aspectRatio);
    return { width, height: width / aspectRatio };
  };

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
          onLayout={(event) =>
            setImagesRowWidth(event.nativeEvent.layout.width)
          }
          style={styles.images}
        >
          {imagesRowWidth > 0 &&
            images.map((image, index) => (
              <Pressable
                accessibilityLabel={title}
                accessibilityRole="imagebutton"
                key={index}
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
            ))}
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
    flexShrink: 1,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
  },
  images: {
    flexDirection: "row",
    gap: imagesGap,
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
    flexGrow: 0,
    flexShrink: 1,
  },
  version: {
    alignSelf: "flex-end",
    opacity: 0.7,
  },
});

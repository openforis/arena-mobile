import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";

import { Objects } from "@openforis/arena-core";

import { useImageFile } from "hooks";
import { Files, ImageUtils, SystemUtils } from "utils";

import { CollapsiblePanel } from "./CollapsiblePanel";
import { Dialog } from "./Dialog";
import { FormItem } from "./FormItem";
import { HView } from "./HView";
import { Image } from "./Image";
import { IconButton } from "./IconButton";
import { LoadingIcon } from "./LoadingIcon";
import { VView } from "./VView";

const styles = StyleSheet.create({
  dialog: { display: "flex", height: "90%", padding: 5 },
  content: { display: "flex", height: "80%", gap: 20 },
  details: { flex: 1 },
  image: { flex: 1, resizeMode: "contain" },
});

const ImageInfo = (props) => {
  const { imageUri: imageUriProp } = props;

  const [info, setInfo] = useState(null);

  const imageUri = useImageFile(imageUriProp);

  const { width, height, size, latitude, longitude } = info ?? {};

  const fetchInfo = useCallback(async () => {
    const { width, height } = await ImageUtils.getSize(imageUri);

    // TODO remove it
    const exifTags = await ImageUtils.getExifTags(imageUri);
    SystemUtils.copyValueToClipboard(JSON.stringify(exifTags));

    const { latitude, longitude } =
      (await ImageUtils.getGPSLocation(imageUri)) ?? {};
    const size = await Files.getSize(imageUri);
    setInfo({
      width,
      height,
      size: Files.toHumanReadableFileSize(size),
      latitude,
      longitude,
    });
  }, [imageUri]);

  useEffect(() => {
    if (imageUri) {
      fetchInfo().catch(() => {
        // ignore it
      });
    }
  }, [fetchInfo, imageUri]);

  if (!info) return <LoadingIcon />;

  const locationString =
    Objects.isEmpty(latitude) || Objects.isEmpty(longitude)
      ? "-"
      : `${latitude},${longitude}`;

  return (
    <VView>
      <FormItem labelKey="common:size">{size}</FormItem>
      <FormItem labelKey="dataEntry:fileAttributeImage.resolution">{`${width}x${height}`}</FormItem>
      <FormItem labelKey="dataEntry:location.label">{locationString}</FormItem>
    </VView>
  );
};

ImageInfo.propTypes = {
  imageUri: PropTypes.string.isRequired,
};

export const ImagePreviewDialog = (props) => {
  const { fileName, imageUri, onClose } = props;

  const onSharePress = useCallback(async () => {
    const mimeType = Files.getMimeTypeFromName(fileName);
    await Files.shareFile({ url: imageUri, mimeType });
  }, [fileName, imageUri]);

  return (
    <Dialog
      onClose={onClose}
      style={styles.dialog}
      title="dataEntry:fileAttributeImage.imagePreview"
    >
      <VView style={styles.content} transparent>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <HView transparent>
          <CollapsiblePanel
            containerStyle={styles.details}
            headerKey="common:details"
          >
            <ImageInfo imageUri={imageUri} />
          </CollapsiblePanel>
          <IconButton icon="share" onPress={onSharePress} textKey="share" />
        </HView>
      </VView>
    </Dialog>
  );
};

ImagePreviewDialog.propTypes = {
  fileName: PropTypes.string.isRequired,
  imageUri: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

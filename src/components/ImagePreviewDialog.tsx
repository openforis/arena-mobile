import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { Numbers, Objects, PointFactory } from "@openforis/arena-core";

import { useImageFile } from "hooks";
import { Files, ImageUtils } from "utils";

import { Button } from "./Button";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { CopyToClipboardButton } from "./CopyToClipboardButton";
import { Dialog } from "./Dialog";
import { FormItem } from "./FormItem";
import { HView } from "./HView";
import { Image } from "./Image";
import { LoadingIcon } from "./LoadingIcon";
import { OpenMapButton } from "./OpenMapButton";
import { Text } from "./Text";
import { VView } from "./VView";

const styles = StyleSheet.create({
  dialog: { display: "flex", height: "90%", padding: 5 },
  content: { display: "flex", height: "80%", gap: 20 },
  shareButton: { alignSelf: "center" },
  details: { flex: 1 },
  image: { flex: 1, resizeMode: "contain" },
});

type ImageInfoState = {
  width: number,
  height: number,
  size: string,
  latitude: number,
  longitude: number,
} | null

type ImageInfoProps = {
  imageUri: string;
  showGeotagInfo?: boolean;
};

const ImageInfo = (props: ImageInfoProps) => {
  const { imageUri: imageUriProp, showGeotagInfo = false } = props;

  const [info, setInfo] = useState(null as ImageInfoState);

  const imageUri = useImageFile(imageUriProp);

  const { width, height, size, latitude, longitude } = (info ?? {}) as any;

  const fetchInfo = useCallback(async () => {
    const { width, height } = await ImageUtils.getSize(imageUri);

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

  const isValidLocation =
    Objects.isNotEmpty(latitude) && Objects.isNotEmpty(longitude);

  const locationString = isValidLocation
    ? `${Numbers.formatDecimal(latitude, 4)}, ${Numbers.formatDecimal(longitude, 4)}`
    : "-";

  const locationStringFull = isValidLocation
    ? `${String(latitude)}, ${String(longitude)}`
    : "";

  const locationPoint = isValidLocation
    ? PointFactory.createInstance({
        x: longitude,
        y: latitude,
      })
    : null;

  return (
    <VView>
      <FormItem labelKey="common:size">{size}</FormItem>
      <FormItem labelKey="dataEntry:fileAttributeImage.resolution">{`${width}x${height}`}</FormItem>
      {showGeotagInfo && (
        <FormItem labelKey="dataEntry:location.label">
          <VView>
            <Text>{locationString}</Text>
            {isValidLocation && (
              <HView>
                <CopyToClipboardButton value={locationStringFull} />
                <OpenMapButton point={locationPoint} size={20} />
              </HView>
            )}
          </VView>
        </FormItem>
      )}
    </VView>
  );
};

type ImagePreviewDialogProps = {
  fileName: string;
  imageUri: string;
  onClose: () => void;
  showGeotagInfo?: boolean;
};

export const ImagePreviewDialog = (props: ImagePreviewDialogProps) => {
  const { fileName, imageUri, onClose, showGeotagInfo = false } = props;

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

        <Button
          icon="share"
          onPress={onSharePress}
          style={styles.shareButton}
          textKey="common:shareFile"
        />

        <HView transparent>
          <CollapsiblePanel
            containerStyle={styles.details}
            headerKey="common:details"
          >
            <ImageInfo imageUri={imageUri} showGeotagInfo={showGeotagInfo} />
          </CollapsiblePanel>
        </HView>
      </VView>
    </Dialog>
  );
};

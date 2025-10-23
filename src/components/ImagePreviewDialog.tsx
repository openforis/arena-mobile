import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

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

const ImageInfo = (props: any) => {
  const { imageUri: imageUriProp, showGeotagInfo = false } = props;

  const [info, setInfo] = useState(null);

  const imageUri = useImageFile(imageUriProp);

  // @ts-expect-error TS(2339): Property 'width' does not exist on type '{}'.
  const { width, height, size, latitude, longitude } = info ?? {};

  const fetchInfo = useCallback(async () => {
    // @ts-expect-error TS(2339): Property 'width' does not exist on type 'unknown'.
    const { width, height } = await ImageUtils.getSize(imageUri);

    const { latitude, longitude } =
      (await ImageUtils.getGPSLocation(imageUri)) ?? {};

    const size = await Files.getSize(imageUri);

    setInfo({
      // @ts-expect-error TS(2345): Argument of type '{ width: any; height: any; size:... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
      <FormItem labelKey="common:size">{size}</FormItem>
      // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
      <FormItem labelKey="dataEntry:fileAttributeImage.resolution">{`${width}x${height}`}</FormItem>
      {showGeotagInfo && (
        // @ts-expect-error TS(2786): 'FormItem' cannot be used as a JSX component.
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

ImageInfo.propTypes = {
  imageUri: PropTypes.string.isRequired,
  showGeotagInfo: PropTypes.bool,
};

export const ImagePreviewDialog = (props: any) => {
  const { fileName, imageUri, onClose, showGeotagInfo = false } = props;

  const onSharePress = useCallback(async () => {
    const mimeType = Files.getMimeTypeFromName(fileName);
    await Files.shareFile({ url: imageUri, mimeType });
  }, [fileName, imageUri]);

  return (
    // @ts-expect-error TS(2786): 'Dialog' cannot be used as a JSX component.
    <Dialog
      onClose={onClose}
      style={styles.dialog}
      title="dataEntry:fileAttributeImage.imagePreview"
    >
      <VView style={styles.content} transparent>
        // @ts-expect-error TS(2786): 'Image' cannot be used as a JSX component.
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

ImagePreviewDialog.propTypes = {
  fileName: PropTypes.string.isRequired,
  imageUri: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showGeotagInfo: PropTypes.bool,
};

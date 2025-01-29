import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";

import { useImageFile } from "hooks";
import { Files, ImageUtils } from "utils";

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

  const { width, height, size } = info ?? {};

  const fetchInfo = useCallback(async () => {
    const { width, height } = await ImageUtils.getSize(imageUri);
    const size = await Files.getSize(imageUri);
    setInfo({ width, height, size: Files.toHumanReadableFileSize(size) });
  }, [imageUri]);

  useEffect(() => {
    if (imageUri) {
      fetchInfo().catch(() => {
        // ignore it
      });
    }
  }, [fetchInfo, imageUri]);

  if (!info) return <LoadingIcon />;

  return (
    <VView>
      <FormItem labelKey="common:size">{size}</FormItem>
      <FormItem labelKey="dataEntry:fileAttributeImage.resolution">{`${width}x${height}`}</FormItem>
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

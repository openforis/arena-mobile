import { useCallback, useEffect, useRef, useState } from "react";

import { Environment, Files } from "utils";

const defaultImageExtension = "jpg";

export const useImageFile = (uri, defaultExtension = defaultImageExtension) => {
  const tempFileUriRef = useRef(null);
  const [finalUri, setFinalUri] = useState(uri);

  const copyToTempFileWithExtension = useCallback(async () => {
    const fileName = Files.getNameFromUri(uri);
    const tempFolderUri = Files.getTempFolderParentUri();
    const fileNameWithExtension = `${fileName}.${defaultExtension}`;
    const tempFileUri = Files.path(tempFolderUri, fileNameWithExtension);
    await Files.copyFile({ from: uri, to: tempFileUri });
    return tempFileUri;
  }, [defaultExtension, uri]);

  useEffect(() => {
    const fileName = Files.getNameFromUri(uri);
    if (
      !Environment.isIOS ||
      !!Files.getExtension(fileName) ||
      tempFileUriRef.current
    )
      return;

    copyToTempFileWithExtension()
      .then((tempFileUri) => {
        tempFileUriRef.current = tempFileUri;
        setFinalUri(tempFileUri);
      })
      .catch(() => {
        // ignore it
      });

    return () => {
      const tempFile = tempFileUriRef.current;
      if (tempFile) {
        Files.del(tempFile)
          .then(() => {})
          .catch(() => {
            // ignore it
          })
          .finally(() => {
            tempFileUriRef.current = null;
          });
      }
    };
  }, [copyToTempFileWithExtension, uri]);

  return finalUri;
};

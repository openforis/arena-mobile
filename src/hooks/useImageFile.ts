import { useCallback, useEffect, useRef, useState } from "react";

import { Environment, Files } from "utils";

const defaultImageExtension = "jpg";

export const useImageFile = (
  uri: any,
  defaultExtension = defaultImageExtension,
) => {
  const tempFileUriRef = useRef(null as any);
  const [finalUri, setFinalUri] = useState(uri);

  const copyToTempFileWithExtension = useCallback(
    async () => Files.copyUriToTempFile({ uri, defaultExtension }),
    [defaultExtension, uri],
  );

  useEffect(() => {
    const uriChanged = uri !== finalUri;
    const fileName = Files.getNameFromUri(uri);
    if (!Environment.isIOS || !!Files.getExtension(fileName)) {
      // on Android, we can preview the file without extension, so we don't need to copy it to a temporary file with extension.
      // On iOS, if the file doesn't have an extension, we need to copy it to a temporary file with extension to allow previewing it in image viewer.
      if (uriChanged) {
        // file uri changed, so we need to update the final uri in local state
        setFinalUri(uri);
      }
      return;
    }
    if (uri === finalUri && tempFileUriRef.current) {
      // file already copied to temp file, so we can use it directly
      return;
    }
    // copy file to temporary file with extension, to allow previewing it in image viewer
    copyToTempFileWithExtension()
      .then((tempFileUri) => {
        tempFileUriRef.current = tempFileUri;
        setFinalUri(tempFileUri);
      })
      .catch(() => {
        // ignore it
      });

    return () => {
      // delete temporary file
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
  }, [copyToTempFileWithExtension, finalUri, uri]);

  return finalUri;
};

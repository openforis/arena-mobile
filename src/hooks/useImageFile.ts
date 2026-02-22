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
    if (!Environment.isIOS) {
      if (uri !== finalUri) {
        setFinalUri(uri);
      }
      return;
    }
    const fileName = Files.getNameFromUri(uri);
    if (!!Files.getExtension(fileName)) {
      // file already has extension, so we can use it directly
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

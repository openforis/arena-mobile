import { useCallback, useEffect, useRef, useState } from "react";

import { Environment, Files } from "utils";

const defaultImageExtension = "jpg";

export const useImageFile = (uri: any, defaultExtension = defaultImageExtension) => {
  const tempFileUriRef = useRef(null);
  const [finalUri, setFinalUri] = useState(uri);

  const copyToTempFileWithExtension = useCallback(
    async () => Files.copyUriToTempFile({ uri, defaultExtension }),
    [defaultExtension, uri]
  );

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
        // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'null'.
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
  }, [copyToTempFileWithExtension, uri]);

  return finalUri;
};

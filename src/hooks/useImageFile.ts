import { useCallback, useEffect, useRef, useState } from "react";

import { Environment, Files } from "utils";

const defaultImageExtension = "jpg";

// on Android the file can be previewed without extension; on iOS a copy with extension is needed
const needsTempFileWithExtension = (uri: any) =>
  Environment.isIOS && !!uri && !Files.hasExtension(uri);

export const useImageFile = (
  uri: any,
  defaultExtension = defaultImageExtension,
) => {
  const tempFileUriRef = useRef(null as any);
  const tempFileSourceUriRef = useRef(null as any);
  // null until the temp file is ready, so the extensionless uri is not used on iOS
  const [finalUri, setFinalUri] = useState(() =>
    needsTempFileWithExtension(uri) ? null : uri,
  );

  const copyToTempFileWithExtension = useCallback(
    async () => Files.copyUriToTempFile({ uri, defaultExtension }),
    [defaultExtension, uri],
  );

  const deleteTempFile = useCallback(async () => {
    const tempFile = tempFileUriRef.current;
    if (!tempFile) {
      return;
    }

    tempFileUriRef.current = null;
    tempFileSourceUriRef.current = null;
    try {
      await Files.del(tempFile);
    } catch {
      // ignore it
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const updateFinalUri = async () => {
      if (!needsTempFileWithExtension(uri)) {
        await deleteTempFile();
        if (mounted) {
          setFinalUri(uri);
        }
        return;
      }

      if (tempFileUriRef.current && tempFileSourceUriRef.current === uri) {
        if (mounted) {
          setFinalUri(tempFileUriRef.current);
        }
        return;
      }

      await deleteTempFile();

      try {
        const tempFileUri = await copyToTempFileWithExtension();

        if (!mounted) {
          Files.del(tempFileUri).catch(() => {
            // ignore it
          });
          return;
        }

        tempFileUriRef.current = tempFileUri;
        tempFileSourceUriRef.current = uri;
        setFinalUri(tempFileUri);
      } catch {
        if (mounted) {
          setFinalUri(uri);
        }
      }
    };

    void updateFinalUri();

    return () => {
      mounted = false;
      deleteTempFile().catch(() => {
        // ignore it
      });
    };
  }, [copyToTempFileWithExtension, deleteTempFile, uri]);

  return finalUri;
};

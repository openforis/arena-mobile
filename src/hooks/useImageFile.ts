import { useCallback, useEffect, useRef, useState } from "react";

import { Environment, Files } from "utils";

const defaultImageExtension = "jpg";

export const useImageFile = (
  uri: any,
  defaultExtension = defaultImageExtension,
) => {
  const tempFileUriRef = useRef(null as any);
  const tempFileSourceUriRef = useRef(null as any);
  const [finalUri, setFinalUri] = useState(uri);

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
      if (!Environment.isIOS || !uri || Files.hasExtension(uri)) {
        // on Android, we can preview the file without extension.
        // On iOS, if the file already has an extension, no temp file is needed.
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

    updateFinalUri();

    return () => {
      mounted = false;
      deleteTempFile().catch(() => {
        // ignore it
      });
    };
  }, [copyToTempFileWithExtension, deleteTempFile, uri]);

  return finalUri;
};

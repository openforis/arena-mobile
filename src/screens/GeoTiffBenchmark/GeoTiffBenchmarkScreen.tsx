import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import {
  Button,
  CopyToClipboardButton,
  HView,
  IconButton,
  ProgressBar,
  ScreenView,
  ScrollView,
  Switch,
  Text,
  VView,
} from "components";
import { GeoTiffBenchmark } from "service/importedMaps/geoTiffBenchmark";
import { Files, log } from "utils";

// developer tool (not translated): decoding timings of a GeoTIFF on the device
const QUICK_RUN_BLOCKS = 16;

type SelectedFile = { uri: string; name: string; size: number };

const styles = StyleSheet.create({
  container: { flex: 1, rowGap: 10, padding: 10 },
  row: { alignItems: "center", columnGap: 10 },
  log: { flex: 1 },
  logText: { fontFamily: "monospace", fontSize: 12 },
});

export const GeoTiffBenchmarkScreen = () => {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [fullImage, setFullImage] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const stopRequestedRef = useRef(false);
  const fileUriRef = useRef<string | null>(null);

  // the picked file is a copy in the cache: delete it when leaving
  useEffect(
    () => () => {
      if (fileUriRef.current) void Files.del(fileUriRef.current, true);
    },
    [],
  );

  const onSelectPress = useCallback(async () => {
    const { assets, canceled } = await DocumentPicker.getDocumentAsync({
      // .tif files are not always reported as image/tiff
      type: "*/*",
      copyToCacheDirectory: true,
    });
    const asset = assets?.[0];
    if (canceled || !asset) return;
    if (fileUriRef.current) await Files.del(fileUriRef.current, true);
    fileUriRef.current = asset.uri;
    setFile({ uri: asset.uri, name: asset.name, size: asset.size ?? 0 });
    setLines([]);
    setProgress(0);
  }, []);

  const onRunPress = useCallback(async () => {
    if (!file) return;
    stopRequestedRef.current = false;
    setRunning(true);
    setProgress(0);
    const header = `GeoTIFF benchmark: ${file.name} (${Files.toHumanReadableFileSize(file.size)}), ${fullImage ? "whole image" : `first ${QUICK_RUN_BLOCKS} blocks`}`;
    setLines([header]);
    const append = (line: string) => setLines((prev) => [...prev, line]);
    try {
      await GeoTiffBenchmark.run({
        fileUri: file.uri,
        maxBlocks: fullImage ? undefined : QUICK_RUN_BLOCKS,
        shouldStop: () => stopRequestedRef.current,
        onLog: append,
        onProgress: (done, total) => setProgress(done / total),
      });
      append("Done");
    } catch (error) {
      log.error("GeoTIFF benchmark failed", error);
      append(`ERROR: ${String(error)}`);
    } finally {
      setRunning(false);
    }
  }, [file, fullImage]);

  const onStopPress = useCallback(() => {
    stopRequestedRef.current = true;
  }, []);

  const report = lines.join("\n");

  const onSharePress = useCallback(async () => {
    const reportUri = Files.path(Files.cacheDirectory, "geotiff-benchmark.txt");
    await Files.writeStringToFile({ content: report, fileUri: reportUri });
    await Files.shareFile({
      url: reportUri,
      mimeType: "text/plain",
      dialogTitle: "GeoTIFF benchmark",
    });
  }, [report]);

  return (
    <ScreenView>
      <VView style={styles.container}>
        <HView style={styles.row}>
          <Button
            disabled={running}
            icon="file-search-outline"
            onPress={onSelectPress}
            textIsI18nKey={false}
            textKey="Select GeoTIFF"
          />
          <Text>{file?.name ?? "No file selected"}</Text>
        </HView>
        <HView style={styles.row}>
          <Switch onChange={setFullImage} value={fullImage} />
          <Text>
            {fullImage
              ? "Decode the whole image"
              : `Decode the first ${QUICK_RUN_BLOCKS} blocks only`}
          </Text>
        </HView>
        <HView style={styles.row}>
          {running ? (
            <Button
              icon="stop"
              onPress={onStopPress}
              textIsI18nKey={false}
              textKey="Stop"
            />
          ) : (
            <Button
              disabled={!file}
              icon="play"
              onPress={onRunPress}
              textIsI18nKey={false}
              textKey="Run"
            />
          )}
          <CopyToClipboardButton value={report} />
          <IconButton
            disabled={running || lines.length === 0}
            icon="share-variant"
            onPress={onSharePress}
          />
        </HView>
        {running && <ProgressBar progress={progress} />}
        <ScrollView style={styles.log}>
          <Text selectable style={styles.logText}>
            {report}
          </Text>
        </ScrollView>
      </VView>
    </ScreenView>
  );
};

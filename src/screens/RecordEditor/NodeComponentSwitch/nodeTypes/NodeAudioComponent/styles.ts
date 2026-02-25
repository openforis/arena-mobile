import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    alignItems: "center",
    flex: 0.5,
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  playbackProgressBarContainer: {
    alignSelf: "stretch",
    width: "100%",
  },
  playbackProgressBar: {
    alignSelf: "stretch",
    height: 8,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  buttonsContainer: {
    alignItems: "center",
    flex: 0.5,
    gap: 20,
    justifyContent: "space-evenly",
  },
  audioRecorderButton: {
    height: 75,
    width: 75,
  },
});

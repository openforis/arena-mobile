import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flex: 0.5,
    padding: 30,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  buttonsContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    width: 75,
    height: 75,
  },
});

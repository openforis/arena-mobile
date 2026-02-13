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
    alignItems: "center",
    flex: 0.5,
    gap: 20,
    justifyContent: "space-evenly",
  },
  cameraButton: {
    width: 75,
    height: 75,
  },
});

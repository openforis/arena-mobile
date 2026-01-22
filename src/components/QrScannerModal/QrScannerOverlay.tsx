import React, { useState } from "react";
import { StyleSheet, View, LayoutChangeEvent } from "react-native";
import { Svg, Defs, Rect, Mask } from "react-native-svg";

const viewFinderSize = 250;

export const QrScannerOverlay = () => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  // Don't render the mask until we have measurements
  const hasLayout = layout.width > 0 && layout.height > 0;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {hasLayout && (
        <>
          <Svg height="100%" width="100%">
            <Defs>
              <Mask id="mask" x="0" y="0" height="100%" width="100%">
                {/* Makes the whole overlay visible */}
                <Rect height="100%" width="100%" fill="#fff" />
                {/* Cuts the hole exactly in the center of the available layout */}
                <Rect
                  x={(layout.width - viewFinderSize) / 2}
                  y={(layout.height - viewFinderSize) / 2}
                  width={viewFinderSize}
                  height={viewFinderSize}
                  rx="20"
                  fill="#000"
                />
              </Mask>
            </Defs>
            <Rect
              height="100%"
              width="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#mask)"
            />
          </Svg>

          {/* White Corners positioned via Flexbox to match the hole */}
          <View style={styles.cornerLayer}>
            <View style={styles.viewFinderCorners} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cornerLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    // Ensure the corners don't block touch events if you add buttons later
    pointerEvents: "none",
  },
  viewFinderCorners: {
    width: viewFinderSize,
    height: viewFinderSize,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 20,
  },
});

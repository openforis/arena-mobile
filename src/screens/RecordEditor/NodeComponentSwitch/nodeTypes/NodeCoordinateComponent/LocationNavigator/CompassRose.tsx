import { useMemo } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { Circle, Line, Polygon, Svg, Text as SvgText } from "react-native-svg";
import { useTheme } from "react-native-paper";

import { View } from "components";
import { ColorUtils } from "utils";

type CompassRoseProps = {
  compassRotStyle: AnimatedStyle<ViewStyle>;
  size: number;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const getTickLen = (
  isCardinalDeg: boolean,
  isInterCardinal: boolean,
  isMajor: boolean,
  R: number,
): number => {
  if (isCardinalDeg) return R * TICK.cardinalLen;
  if (isInterCardinal) return R * TICK.interCardinalLen;
  if (isMajor) return R * TICK.majorLen;
  return R * TICK.minorLen;
};

const getTickStrokeWidth = (
  isCardinalDeg: boolean,
  isInterCardinal: boolean,
): number => {
  if (isCardinalDeg) return TICK.cardinalStroke;
  if (isInterCardinal) return TICK.interCardinalStroke;
  return TICK.minorStroke;
};

const getCardinalFontSize = (
  isNorth: boolean,
  isCardinalOnly: boolean,
  size: number,
): number => {
  if (isNorth) return size * FONT_SIZE.north;
  if (isCardinalOnly) return size * FONT_SIZE.cardinal;
  return size * FONT_SIZE.interCardinal;
};

const getCardinalLabelR = (isCardinalOnly: boolean, R: number): number => {
  if (isCardinalOnly) return R - R * LABEL_RADIUS.cardinal;
  return R - R * LABEL_RADIUS.interCardinal;
};

const getCardinalFill = (
  isNorth: boolean,
  isCardinalOnly: boolean,
  primaryColor: string,
  cardinalColor: string,
  degreeColor: string,
): string => {
  if (isNorth) return primaryColor;
  if (isCardinalOnly) return cardinalColor;
  return degreeColor;
};

const cardinals = [
  { label: "N", deg: 0 },
  { label: "NE", deg: 45 },
  { label: "E", deg: 90 },
  { label: "SE", deg: 135 },
  { label: "S", deg: 180 },
  { label: "SW", deg: 225 },
  { label: "W", deg: 270 },
  { label: "NW", deg: 315 },
];

const degreeLabels = [30, 60, 120, 150, 210, 240, 300, 330];

const OPACITY = {
  majorTick: 0.8,
  minorTick: 0.25,
  degreeLabel: 0.55,
  bezel: 0.15,
  accentRing: 0.12,
  bottomTriangle: 0.4,
  bearingIndicator: 0.75,
} as const;

// Ratios relative to compass radius R
const TICK = {
  cardinalLen: 0.16,
  interCardinalLen: 0.12,
  majorLen: 0.09,
  minorLen: 0.05,
  cardinalStroke: 2,
  interCardinalStroke: 1.5,
  minorStroke: 1,
  majorStep: 10,
  minorStep: 5,
} as const;

const LABEL_RADIUS = {
  cardinal: 0.22,
  interCardinal: 0.18,
  degree: 0.3,
  accentRing: 0.18,
} as const;

// Ratios relative to compass size
const FONT_SIZE = {
  north: 0.065,
  cardinal: 0.055,
  interCardinal: 0.038,
  degree: 0.028,
} as const;

// Fixed pixel values for the bearing indicator triangles
const BEARING = {
  triHalfW: 7,
  triHeight: 16,
  triPad: 6,
} as const;

export const CompassRose = (props: CompassRoseProps) => {
  const { compassRotStyle, size } = props;

  const theme = useTheme();

  const cx = size / 2; // Center x-coordinate
  const cy = size / 2; // Center y-coordinate
  const R = size / 2 - 4; // Compass radius with some padding for bezel

  // ── Derived colors ──────────────────────────────────────────────────────
  const primaryColor = theme.colors.primary;
  const onSurface = theme.colors.onSurface;
  const surfaceColor = theme.colors.surface;
  const majorTickColor = ColorUtils.withOpacity(onSurface, OPACITY.majorTick);
  const minorTickColor = ColorUtils.withOpacity(onSurface, OPACITY.minorTick);
  const cardinalColor = onSurface;
  const degreeColor = ColorUtils.withOpacity(onSurface, OPACITY.degreeLabel);
  const bezzelColor = ColorUtils.withOpacity(onSurface, OPACITY.bezel);

  // ── Tick marks ──────────────────────────────────────────────────────────
  const ticks = useMemo(
    () =>
      Array.from({ length: 360 }, (_, i) => {
        const isCardinalDeg = i % 90 === 0;
        const isInterCardinal = i % 45 === 0 && !isCardinalDeg;
        const isMajor = i % TICK.majorStep === 0;
        if (!isMajor && i % TICK.minorStep !== 0) return null;

        const tickLen = getTickLen(isCardinalDeg, isInterCardinal, isMajor, R);
        const innerR = R - tickLen;
        const rad = toRad(i);
        const sinA = Math.sin(rad);
        const cosA = Math.cos(rad);
        const tickStrokeWidth = getTickStrokeWidth(
          isCardinalDeg,
          isInterCardinal,
        );

        return (
          <Line
            key={i}
            x1={cx + R * sinA}
            y1={cy - R * cosA}
            x2={cx + innerR * sinA}
            y2={cy - innerR * cosA}
            stroke={
              isCardinalDeg || isInterCardinal ? majorTickColor : minorTickColor
            }
            strokeWidth={tickStrokeWidth}
          />
        );
      }),
    [cx, cy, R, majorTickColor, minorTickColor],
  );

  // ── Cardinal + inter-cardinal labels ────────────────────────────────────
  const cardinalLabels = useMemo(
    () =>
      cardinals.map(({ label, deg }) => {
        const isNorth = deg === 0;
        const isCardinalOnly = deg % 90 === 0;
        const labelR = getCardinalLabelR(isCardinalOnly, R);
        const cardinalFontSize = getCardinalFontSize(
          isNorth,
          isCardinalOnly,
          size,
        );
        const cardinalFill = getCardinalFill(
          isNorth,
          isCardinalOnly,
          primaryColor,
          cardinalColor,
          degreeColor,
        );
        const cardinalFontWeight =
          isNorth || isCardinalOnly ? "bold" : "normal";
        const rad = toRad(deg);

        return (
          <SvgText
            key={label}
            x={cx + labelR * Math.sin(rad)}
            y={cy - labelR * Math.cos(rad)}
            textAnchor="middle"
            alignmentBaseline="central"
            fontSize={cardinalFontSize}
            fontWeight={cardinalFontWeight}
            fill={cardinalFill}
          >
            {label}
          </SvgText>
        );
      }),
    [cx, cy, R, size, primaryColor, cardinalColor, degreeColor],
  );

  // ── Degree labels every 30° (non-cardinal/intercardinal) ────────────────
  const degreeLabelsElements = useMemo(
    () =>
      degreeLabels.map((deg) => {
        const rad = toRad(deg);
        const labelR = R - R * LABEL_RADIUS.degree;
        return (
          <SvgText
            key={`deg-${deg}`}
            x={cx + labelR * Math.sin(rad)}
            y={cy - labelR * Math.cos(rad)}
            textAnchor="middle"
            alignmentBaseline="central"
            fontSize={size * FONT_SIZE.degree}
            fill={degreeColor}
          >
            {deg}
          </SvgText>
        );
      }),
    [cx, cy, R, size, degreeColor],
  );

  // ── Bearing indicator triangles (fixed, not rotating) ───────────────────
  const { triHalfW, triHeight, triPad } = BEARING;
  const topTriPoints = `${cx - triHalfW},${triPad} ${cx + triHalfW},${triPad} ${cx},${triPad + triHeight}`;
  const botTriPoints = `${cx - triHalfW},${size - triPad} ${cx + triHalfW},${size - triPad} ${cx},${size - triPad - triHeight}`;

  const absoluteFill = StyleSheet.absoluteFill;
  const layerStyle = [absoluteFill, { width: size, height: size }];

  return (
    <View style={{ width: size, height: size }}>
      {/* ── Layer 0: Static background ──────────────────────────────────── */}
      <Svg width={size} height={size} style={absoluteFill}>
        {/* Bezel ring */}
        <Circle cx={cx} cy={cy} r={R + 2} fill={bezzelColor} />
        {/* Face background */}
        <Circle cx={cx} cy={cy} r={R} fill={surfaceColor} />
        {/* Inner face ring (subtle) */}
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={majorTickColor}
          strokeWidth={1}
          fill="none"
        />
        {/* Inner accent ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={R * LABEL_RADIUS.accentRing}
          stroke={ColorUtils.withOpacity(onSurface, OPACITY.accentRing)}
          strokeWidth={1}
          fill="none"
        />
      </Svg>

      {/* ── Layer 1: Rotating compass rose ──────────────────────────────── */}
      <Animated.View style={[layerStyle, compassRotStyle]}>
        <Svg width={size} height={size}>
          {ticks}
          {cardinalLabels}
          {degreeLabelsElements}
        </Svg>
      </Animated.View>

      {/* ── Layer 2: Fixed bearing indicators ───────────────────────────── */}
      <Svg width={size} height={size} style={absoluteFill}>
        <Polygon
          points={topTriPoints}
          fill={primaryColor}
          opacity={OPACITY.bearingIndicator}
        />
        <Polygon
          points={botTriPoints}
          fill={ColorUtils.withOpacity(primaryColor, OPACITY.bottomTriangle)}
        />
      </Svg>
    </View>
  );
};

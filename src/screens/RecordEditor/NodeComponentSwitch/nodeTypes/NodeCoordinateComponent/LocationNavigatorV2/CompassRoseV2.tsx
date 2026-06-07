import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Circle,
  Line,
  Polygon,
  Rect,
  Svg,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "react-native-paper";

import { View } from "components";
import { ColorUtils } from "utils";

type CompassRoseV2Props = {
  heading: number;
  relativeAngle: number;
  arrowColor: string;
  isProximity: boolean;
  proximityDotAngle: number;
  size: number;
};

const shortestAngleDelta = (from: number, to: number): number => {
  let d = ((to - from) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

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

export const CompassRoseV2 = (props: CompassRoseV2Props) => {
  const {
    heading,
    relativeAngle,
    arrowColor,
    isProximity,
    proximityDotAngle,
    size,
  } = props;

  const theme = useTheme();

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  // ── Derived colors ──────────────────────────────────────────────────────
  const primaryColor = theme.colors.primary;
  const onSurface = theme.colors.onSurface;
  const surfaceColor = theme.colors.surface;
  const majorTickColor = ColorUtils.withOpacity(onSurface, 0.8);
  const minorTickColor = ColorUtils.withOpacity(onSurface, 0.25);
  const cardinalColor = onSurface;
  const degreeColor = ColorUtils.withOpacity(onSurface, 0.55);
  const bezzelColor = ColorUtils.withOpacity(onSurface, 0.15);

  // ── Reanimated shared values (accumulated, never wraps) ─────────────────
  const compassRotSv = useSharedValue(0);
  const arrowRotSv = useSharedValue(0);

  const prevHeadingRef = useRef(heading);
  const prevRelAngleRef = useRef(relativeAngle);

  useEffect(() => {
    const delta = shortestAngleDelta(prevHeadingRef.current, heading);
    prevHeadingRef.current = heading;
    compassRotSv.value = withTiming(compassRotSv.value - delta, {
      duration: 150,
    });
  }, [heading, compassRotSv]);

  useEffect(() => {
    const delta = shortestAngleDelta(prevRelAngleRef.current, relativeAngle);
    prevRelAngleRef.current = relativeAngle;
    arrowRotSv.value = withTiming(arrowRotSv.value + delta, { duration: 150 });
  }, [relativeAngle, arrowRotSv]);

  const compassRotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotSv.value}deg` }],
  }));

  const arrowRotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotSv.value}deg` }],
  }));

  // ── Tick marks ──────────────────────────────────────────────────────────
  const ticks = Array.from({ length: 360 }, (_, i) => {
    const isCardinalDeg = i % 90 === 0;
    const isInterCardinal = i % 45 === 0 && !isCardinalDeg;
    const isMajor = i % 10 === 0;
    if (!isMajor && i % 5 !== 0) return null;

    const tickLen = isCardinalDeg
      ? R * 0.16
      : isInterCardinal
        ? R * 0.12
        : isMajor
          ? R * 0.09
          : R * 0.05;

    const innerR = R - tickLen;
    const rad = toRad(i);
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);

    return (
      <Line
        key={i}
        x1={cx + R * sinA}
        y1={cy - R * cosA}
        x2={cx + innerR * sinA}
        y2={cy - innerR * cosA}
        stroke={isCardinalDeg || isInterCardinal ? majorTickColor : minorTickColor}
        strokeWidth={isCardinalDeg ? 2 : isInterCardinal ? 1.5 : 1}
      />
    );
  });

  // ── Proximity dot ───────────────────────────────────────────────────────
  const proximityRad = toRad(proximityDotAngle);
  const dotR = R - 10;
  const dotX = cx + dotR * Math.sin(proximityRad);
  const dotY = cy - dotR * Math.cos(proximityRad);

  // ── Arrow geometry (all relative to compass center) ─────────────────────
  const arrowTipY = cy - R * 0.68;
  const arrowShoulderY = cy - R * 0.32;
  const arrowHeadHalfW = R * 0.08;
  const stemHalfW = R * 0.04;
  const tailY = cy + R * 0.28;
  const tailHalfW = R * 0.055;

  const arrowHeadPoints = `${cx},${arrowTipY} ${cx - arrowHeadHalfW},${arrowShoulderY} ${cx + arrowHeadHalfW},${arrowShoulderY}`;
  const tailPoints = `${cx},${tailY} ${cx - tailHalfW},${cy + R * 0.08} ${cx + tailHalfW},${cy + R * 0.08}`;

  // ── Bearing indicator triangles (fixed, not rotating) ───────────────────
  const triHalfW = 7;
  const triHeight = 16;
  const topTriPoints = `${cx - triHalfW},${6} ${cx + triHalfW},${6} ${cx},${6 + triHeight}`;
  const botTriPoints = `${cx - triHalfW},${size - 6} ${cx + triHalfW},${size - 6} ${cx},${size - 6 - triHeight}`;

  const absoluteFill = StyleSheet.absoluteFillObject;
  const layerStyle = [absoluteFill, { width: size, height: size }];

  return (
    <View style={{ width: size, height: size }}>
      {/* ── Layer 0: Static background ──────────────────────────────────── */}
      <Svg
        width={size}
        height={size}
        style={absoluteFill}
      >
        {/* Bezel ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={R + 2}
          fill={bezzelColor}
        />
        {/* Face background */}
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          fill={surfaceColor}
        />
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
          r={R * 0.18}
          stroke={ColorUtils.withOpacity(onSurface, 0.12)}
          strokeWidth={1}
          fill="none"
        />
      </Svg>

      {/* ── Layer 1: Rotating compass rose ──────────────────────────────── */}
      <Animated.View style={[layerStyle, compassRotStyle]}>
        <Svg width={size} height={size}>
          {/* Tick marks */}
          {ticks}

          {/* Cardinal + inter-cardinal labels */}
          {cardinals.map(({ label, deg }) => {
            const isNorth = deg === 0;
            const isCardinalOnly = deg % 90 === 0;
            const labelR = isCardinalOnly ? R - R * 0.22 : R - R * 0.18;
            const rad = toRad(deg);
            return (
              <SvgText
                key={label}
                x={cx + labelR * Math.sin(rad)}
                y={cy - labelR * Math.cos(rad)}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={isNorth ? size * 0.065 : isCardinalOnly ? size * 0.055 : size * 0.038}
                fontWeight={isNorth || isCardinalOnly ? "bold" : "normal"}
                fill={isNorth ? primaryColor : isCardinalOnly ? cardinalColor : degreeColor}
              >
                {label}
              </SvgText>
            );
          })}

          {/* Degree labels every 30° (non-cardinal/intercardinal) */}
          {degreeLabels.map((deg) => {
            const rad = toRad(deg);
            const labelR = R - R * 0.30;
            return (
              <SvgText
                key={`deg-${deg}`}
                x={cx + labelR * Math.sin(rad)}
                y={cy - labelR * Math.cos(rad)}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={size * 0.028}
                fill={degreeColor}
              >
                {deg}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>

      {/* ── Layer 2: Fixed bearing indicators ───────────────────────────── */}
      <Svg width={size} height={size} style={absoluteFill}>
        <Polygon
          points={topTriPoints}
          fill={primaryColor}
          opacity={0.75}
        />
        <Polygon
          points={botTriPoints}
          fill={ColorUtils.withOpacity(primaryColor, 0.4)}
        />
      </Svg>

      {/* ── Layer 3: Rotating arrow (+ proximity dot) ────────────────────── */}
      <Animated.View style={[layerStyle, arrowRotStyle]}>
        <Svg width={size} height={size}>
          {/* Arrow head */}
          <Polygon
            points={arrowHeadPoints}
            fill={arrowColor}
          />
          {/* Arrow shaft */}
          <Rect
            x={cx - stemHalfW}
            y={arrowShoulderY}
            width={stemHalfW * 2}
            height={tailY - arrowShoulderY - R * 0.05}
            fill={arrowColor}
            opacity={0.75}
          />
          {/* Tail fin */}
          <Polygon
            points={tailPoints}
            fill={ColorUtils.withOpacity(arrowColor, 0.45)}
          />
          {/* Center dot */}
          <Circle cx={cx} cy={cy} r={R * 0.05} fill={arrowColor} />

          {/* Proximity dot on compass edge */}
          {isProximity && (
            <Circle cx={dotX} cy={dotY} r={9} fill="#4caf50" />
          )}
        </Svg>
      </Animated.View>
    </View>
  );
};

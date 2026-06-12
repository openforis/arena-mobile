import { useMemo } from "react";
import { View } from "react-native";
import {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Polygon,
  Svg,
  Text as SvgText,
} from "react-native-svg";

import { TARGET_COLOR, TargetLocationIcon } from "./TargetLocationIcon";
import { useTheme } from "react-native-paper";

import { ColorUtils } from "utils";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const GRID_STEPS_M = [
  0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 50000,
];

function pickGridStep(viewRadiusMetres: number, minStepM = 0): number {
  const target = Math.max(viewRadiusMetres / 3, minStepM);
  for (const step of GRID_STEPS_M) {
    if (step >= target) return step;
  }
  return GRID_STEPS_M[GRID_STEPS_M.length - 1]!;
}

function formatGridLabel(metres: number): string {
  if (metres >= 1000) return `${metres / 1000} km`;
  return `${metres} m`;
}

// ── Sub-components (SVG primitives, rendered inside <Svg>) ───────────────────

type GridProps = {
  cx: number;
  cy: number;
  R: number;
  size: number;
  gridStepPx: number;
  gridStepM: number;
  onSurface: string;
};

const RadarGrid = ({
  cx,
  cy,
  R,
  size,
  gridStepPx,
  gridStepM,
  onSurface,
}: GridProps) => {
  const lines = useMemo(() => {
    if (gridStepPx < 5) return [];
    const gridStroke = ColorUtils.withOpacity(onSurface, 0.1);
    const axisStroke = ColorUtils.withOpacity(onSurface, 0.2);
    const n = Math.ceil(R / gridStepPx) + 1;
    const result: React.ReactElement[] = [];
    for (let i = -n; i <= n; i++) {
      const off = i * gridStepPx;
      const isAxis = i === 0;
      const stroke = isAxis ? axisStroke : gridStroke;
      const strokeWidth = isAxis ? 3 : 1.5;
      result.push(
        <Line
          key={`v${i}`}
          x1={cx + off}
          y1={cy - R}
          x2={cx + off}
          y2={cy + R}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />,
        <Line
          key={`h${i}`}
          x1={cx - R}
          y1={cy + off}
          x2={cx + R}
          y2={cy + off}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />,
      );
    }
    return result;
  }, [cx, cy, R, gridStepPx, onSurface]);

  return (
    <>
      <G clipPath="url(#radarClip)">{lines}</G>
      {gridStepPx >= 5 && (
        <SvgText
          x={cx + gridStepPx + 4}
          y={cy - 5}
          fontSize={size * 0.05}
          fill={ColorUtils.withOpacity(onSurface, 0.38)}
          clipPath="url(#radarClip)"
        >
          {formatGridLabel(gridStepM)}
        </SvgText>
      )}
    </>
  );
};

type AccuracyCircleProps = {
  cx: number;
  cy: number;
  accuracyRpx: number | null;
};

const AccuracyCircle = ({ cx, cy, accuracyRpx }: AccuracyCircleProps) => {
  if (accuracyRpx == null) return null;
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={accuracyRpx}
      fill="rgba(100,180,255,0.10)"
      stroke="rgba(100,180,255,0.42)"
      strokeWidth={1.5}
      clipPath="url(#radarClip)"
    />
  );
};

const TARGET_ICON_SIZE = 18;
const TARGET_ICON_HALF = TARGET_ICON_SIZE / 2;


type CompassNeedleProps = {
  cx: number;
  cy: number;
  widgetR: number;
  heading: number;
  surfaceColor: string;
  onSurface: string;
};

const CompassNeedle = ({
  cx,
  cy,
  widgetR,
  heading,
  surfaceColor,
  onSurface,
}: CompassNeedleProps) => {
  const needleLen = widgetR * 1;
  const halfW = widgetR * 0.32;

  // North direction in heading-up frame: screen-up = current heading, so North = -heading from up
  const northRad = toRad(-heading);
  const nDx = Math.sin(northRad);
  const nDy = -Math.cos(northRad);
  // Correct perpendicular to (sin θ, -cos θ) is (cos θ, sin θ)
  const perpX = Math.cos(northRad);
  const perpY = Math.sin(northRad);

  const nTipX = cx + needleLen * nDx;
  const nTipY = cy + needleLen * nDy;
  const sTipX = cx - needleLen * nDx;
  const sTipY = cy - needleLen * nDy;
  const midLX = cx - halfW * perpX;
  const midLY = cy - halfW * perpY;
  const midRX = cx + halfW * perpX;
  const midRY = cy + halfW * perpY;

  const northPts = `${nTipX},${nTipY} ${midLX},${midLY} ${midRX},${midRY}`;
  const southPts = `${sTipX},${sTipY} ${midLX},${midLY} ${midRX},${midRY}`;

  return (
    <>
      <Circle
        cx={cx}
        cy={cy}
        r={widgetR * 1.2}
        fill={ColorUtils.withOpacity(surfaceColor, 0.9)}
        stroke={ColorUtils.withOpacity(onSurface, 0.4)}
        strokeWidth={2}
      />
      <Polygon
        points={northPts}
        fill="rgba(229,57,53,0.65)"
        stroke="rgba(183,28,28,0.8)"
        strokeWidth={0.8}
      />
      <Polygon
        points={southPts}
        fill="rgba(55,71,79,0.55)"
        stroke="rgba(38,50,56,0.7)"
        strokeWidth={0.8}
      />
    </>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

type RadarViewProps = {
  size: number;
  relativeAngle: number;
  distance: number;
  heading: number;
  accuracy: number | null;
};

export const RadarView = ({
  size,
  relativeAngle,
  distance,
  heading,
  accuracy,
}: RadarViewProps) => {
  const theme = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;

  const { colors } = theme;
  const onSurface = colors.onSurface;
  const surfaceColor = colors.surface;

  const isFiniteDistance = isFinite(distance) && distance > 0;
  const viewRadiusM = isFiniteDistance ? distance * 1.45 : 50;
  const pixelsPerMetre = R / viewRadiusM;

  const gridStepM = useMemo(
    () => pickGridStep(viewRadiusM, accuracy ?? 0),
    [viewRadiusM, accuracy],
  );
  const gridStepPx = gridStepM * pixelsPerMetre;

  const rad = toRad(relativeAngle);
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const rawDistPx = isFiniteDistance ? distance * pixelsPerMetre : 0;
  const isOffScreen = rawDistPx > R - 14;
  const clampedDistPx = Math.min(rawDistPx, R - 14);
  const targetX = cx + clampedDistPx * dx;
  const targetY = cy + clampedDistPx * dy;

  const arrowSz = 9;
  const arrowCentreR = R - arrowSz - 2;
  const aCx = cx + arrowCentreR * dx;
  const aCy = cy + arrowCentreR * dy;
  const px = Math.cos(rad);
  const py = Math.sin(rad);
  const edgeArrowPts = [
    `${aCx + arrowSz * dx},${aCy + arrowSz * dy}`,
    `${aCx - arrowSz * 0.45 * dx - arrowSz * 0.48 * px},${aCy - arrowSz * 0.45 * dy - arrowSz * 0.48 * py}`,
    `${aCx - arrowSz * 0.45 * dx + arrowSz * 0.48 * px},${aCy - arrowSz * 0.45 * dy + arrowSz * 0.48 * py}`,
  ].join(" ");

  const accuracyRpx =
    accuracy != null
      ? Math.min(R - 2, Math.max(3, accuracy * pixelsPerMetre))
      : null;

  // Compass anchored to the bottom-right corner of the SVG
  const compassWidgetR = size * 0.045;
  const compMargin = compassWidgetR * 1.3;
  const compCx = size - compMargin;
  const compCy = size - compMargin;

  const borderLineWidth = 3;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <ClipPath id="radarClip">
            <Circle cx={cx} cy={cy} r={R} />
          </ClipPath>
        </Defs>

        {/* Background */}
        <Circle cx={cx} cy={cy} r={R} fill={surfaceColor} />
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={ColorUtils.withOpacity(onSurface, 0.18)}
          strokeWidth={borderLineWidth}
          fill="none"
        />

        <RadarGrid
          cx={cx}
          cy={cy}
          R={R}
          size={size}
          gridStepPx={gridStepPx}
          gridStepM={gridStepM}
          onSurface={onSurface}
        />
        <AccuracyCircle cx={cx} cy={cy} accuracyRpx={accuracyRpx} />
        {isFiniteDistance && isOffScreen && (
          <Polygon points={edgeArrowPts} fill={TARGET_COLOR} />
        )}
        <CompassNeedle
          cx={compCx}
          cy={compCy}
          widgetR={compassWidgetR}
          heading={heading}
          surfaceColor={surfaceColor}
          onSurface={onSurface}
        />
      </Svg>
      {isFiniteDistance && !isOffScreen && (
        <View
          style={{
            position: "absolute",
            left: targetX - TARGET_ICON_HALF,
            top: targetY - TARGET_ICON_HALF,
          }}
        >
          <TargetLocationIcon size={TARGET_ICON_SIZE} />
        </View>
      )}
    </View>
  );
};

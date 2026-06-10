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
import { useTheme } from "react-native-paper";

import { ColorUtils } from "utils";

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Nice round grid step candidates in metres
const GRID_STEPS_M = [
  0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 50000,
];

// Pick the smallest step that is ≥ viewRadius/3 so we get ~3 lines per half
function pickGridStep(viewRadiusMetres: number): number {
  const target = viewRadiusMetres / 3;
  for (const step of GRID_STEPS_M) {
    if (step >= target) return step;
  }
  return GRID_STEPS_M[GRID_STEPS_M.length - 1]!;
}

function formatGridLabel(metres: number): string {
  if (metres >= 1000) return `${metres / 1000} km`;
  return `${metres} m`;
}

type RadarViewProps = {
  size: number;
  // Angle from current heading to target (0 = straight ahead / screen-up)
  relativeAngle: number;
  // Distance to target in metres
  distance: number;
  // Device heading in degrees (North = 0, clockwise)
  heading: number;
  // GPS accuracy in metres (or null)
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
  const primaryColor = colors.primary;

  const isFiniteDistance = isFinite(distance) && distance > 0;
  // Keep target at ~70 % of visible radius so there is margin around it
  const viewRadiusM = isFiniteDistance ? distance * 1.45 : 50;
  const pixelsPerMetre = R / viewRadiusM;

  const gridStepM = useMemo(() => pickGridStep(viewRadiusM), [viewRadiusM]);
  const gridStepPx = gridStepM * pixelsPerMetre;

  // ── Grid lines (axis-aligned = heading-up frame) ────────────────────────
  const gridElements = useMemo(() => {
    if (gridStepPx < 5) return [];
    const gridStroke = ColorUtils.withOpacity(onSurface, 0.1);
    const axisStroke = ColorUtils.withOpacity(onSurface, 0.2);
    const n = Math.ceil(R / gridStepPx) + 1;
    const elements: React.ReactElement[] = [];

    for (let i = -n; i <= n; i++) {
      const off = i * gridStepPx;
      const isAxis = i === 0;
      const stroke = isAxis ? axisStroke : gridStroke;
      const sw = isAxis ? 1.2 : 0.65;
      elements.push(
        <Line
          key={`v${i}`}
          x1={cx + off}
          y1={cy - R}
          x2={cx + off}
          y2={cy + R}
          stroke={stroke}
          strokeWidth={sw}
        />,
        <Line
          key={`h${i}`}
          x1={cx - R}
          y1={cy + off}
          x2={cx + R}
          y2={cy + off}
          stroke={stroke}
          strokeWidth={sw}
        />,
      );
    }
    return elements;
  }, [cx, cy, R, gridStepPx, onSurface]);

  // ── Target dot / off-screen edge arrow ─────────────────────────────────
  const rad = toRad(relativeAngle);
  const dx = Math.sin(rad); // forward unit vector x in SVG coords
  const dy = -Math.cos(rad); //                     y
  const rawDistPx = isFiniteDistance ? distance * pixelsPerMetre : 0;
  const isOffScreen = rawDistPx > R - 14;
  const clampedDistPx = Math.min(rawDistPx, R - 14);
  const targetX = cx + clampedDistPx * dx;
  const targetY = cy + clampedDistPx * dy;

  // Arrow tip pointing outward toward the target, positioned near circle edge
  const arrowSz = 9;
  const arrowCentreR = R - arrowSz - 2;
  const aCx = cx + arrowCentreR * dx;
  const aCy = cy + arrowCentreR * dy;
  const px = Math.cos(rad); // perpendicular unit vector x
  const py = Math.sin(rad); //                           y
  const edgeArrowPts = [
    `${aCx + arrowSz * dx},${aCy + arrowSz * dy}`,
    `${aCx - arrowSz * 0.45 * dx - arrowSz * 0.48 * px},${aCy - arrowSz * 0.45 * dy - arrowSz * 0.48 * py}`,
    `${aCx - arrowSz * 0.45 * dx + arrowSz * 0.48 * px},${aCy - arrowSz * 0.45 * dy + arrowSz * 0.48 * py}`,
  ].join(" ");

  // ── Accuracy circle ─────────────────────────────────────────────────────
  const accuracyRpx =
    accuracy != null
      ? Math.min(R - 2, Math.max(3, accuracy * pixelsPerMetre))
      : null;

  // ── Compass widget (bottom-right quadrant) ──────────────────────────────
  // Place center so the compass background circle just kisses the radar border.
  const SQRT2_INV = 1 / Math.SQRT2;
  const compassWidgetR = size * 0.065;
  const compassOffset = R - compassWidgetR - 2; // far edge == radar border
  const compCx = cx + compassOffset * SQRT2_INV;
  const compCy = cy + compassOffset * SQRT2_INV;

  // Classic elongated diamond compass needle — tips extend beyond the background circle
  const needleLen = compassWidgetR * 1.1;
  const halfW = compassWidgetR * 0.28;

  // North direction in heading-up frame: screen-up = heading, so North = -heading from up
  const northRad = toRad(-heading);
  const nDx = Math.sin(northRad);
  const nDy = -Math.cos(northRad);
  const nPerp = northRad + Math.PI / 2;

  const nTipX = compCx + needleLen * nDx;
  const nTipY = compCy + needleLen * nDy;
  const sTipX = compCx - needleLen * nDx;
  const sTipY = compCy - needleLen * nDy;
  const midLX = compCx - halfW * Math.cos(nPerp);
  const midLY = compCy - halfW * Math.sin(nPerp);
  const midRX = compCx + halfW * Math.cos(nPerp);
  const midRY = compCy + halfW * Math.sin(nPerp);

  const northNeedlePts = `${nTipX},${nTipY} ${midLX},${midLY} ${midRX},${midRY}`;
  const southNeedlePts = `${sTipX},${sTipY} ${midLX},${midLY} ${midRX},${midRY}`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <ClipPath id="radarClip">
            <Circle cx={cx} cy={cy} r={R} />
          </ClipPath>
        </Defs>

        {/* Radar background circle */}
        <Circle cx={cx} cy={cy} r={R} fill={surfaceColor} />
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={ColorUtils.withOpacity(onSurface, 0.18)}
          strokeWidth={1}
          fill="none"
        />

        {/* Grid (clipped to circle) */}
        <G clipPath="url(#radarClip)">{gridElements}</G>

        {/* Grid scale label – just right of the first positive vertical line */}
        {gridStepPx >= 5 && (
          <SvgText
            x={cx + gridStepPx + 4}
            y={cy - 5}
            fontSize={size * 0.03}
            fill={ColorUtils.withOpacity(onSurface, 0.38)}
            clipPath="url(#radarClip)"
          >
            {formatGridLabel(gridStepM)}
          </SvgText>
        )}

        {/* Accuracy circle */}
        {accuracyRpx != null && (
          <Circle
            cx={cx}
            cy={cy}
            r={accuracyRpx}
            fill="rgba(100,180,255,0.10)"
            stroke="rgba(100,180,255,0.42)"
            strokeWidth={1.5}
            clipPath="url(#radarClip)"
          />
        )}

        {/* Target: dot when visible, arrowhead at edge when off-screen */}
        {isFiniteDistance &&
          (isOffScreen ? (
            <Polygon points={edgeArrowPts} fill="#4caf50" />
          ) : (
            <Circle cx={targetX} cy={targetY} r={9} fill="#4caf50" />
          ))}

        {/* Center cross – current location */}
        <Line
          x1={cx - 11}
          y1={cy}
          x2={cx + 11}
          y2={cy}
          stroke={primaryColor}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Line
          x1={cx}
          y1={cy - 11}
          x2={cx}
          y2={cy + 11}
          stroke={primaryColor}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={cy} r={3.5} fill={primaryColor} />

        {/* ── Compass widget ─────────────────────────────────────────────── */}
        <Circle
          cx={compCx}
          cy={compCy}
          r={compassWidgetR + 2}
          fill={ColorUtils.withOpacity(surfaceColor, 0.9)}
          stroke={ColorUtils.withOpacity(onSurface, 0.22)}
          strokeWidth={1}
        />
        {/* North half (primary colour) */}
        <Polygon points={northNeedlePts} fill={primaryColor} />
        {/* South half (dimmed) */}
        <Polygon
          points={southNeedlePts}
          fill={ColorUtils.withOpacity(onSurface, 0.28)}
        />
      </Svg>
    </View>
  );
};

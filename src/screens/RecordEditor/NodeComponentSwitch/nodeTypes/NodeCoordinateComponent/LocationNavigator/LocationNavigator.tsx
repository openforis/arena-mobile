import { useMemo, useState } from "react";
import { useTheme } from "react-native-paper";

import {
  Button,
  FlexWrapView,
  FormItem,
  HView,
  IconButton,
  LoadingIcon,
  Modal,
  ScrollView,
  SegmentedButtons,
  Text,
  VView,
} from "components";
import { useMinScreenDimension } from "hooks";
import { DeviceInfoSelectors } from "state";

import { LocationNavigatorInfoDialog } from "./LocationNavigatorInfoDialog";
import { AccuracyCircle } from "./AccuracyCircle";
import { CenterCross } from "./CenterCross";
import { CompassRose } from "./CompassRose";
import { CurrentLocationIcon } from "./CurrentLocationIcon";
import { RadarView } from "./RadarView";
import { NavigatorArrow } from "./NavigatorArrow";
import { TargetLocationIcon } from "./TargetLocationIcon";
import { TargetPointDot } from "./TargetPointDot";
import styles, { loadingOverlayAbsoluteStyle } from "./styles";
import { useCompassAnimation } from "./useCompassAnimation";
import { useLocationNavigator } from "./useLocationNavigator";

const loadingOverlay = (
  <LoadingIcon size="large" style={loadingOverlayAbsoluteStyle} />
);

const DEG = "°";

const formatAngle = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${v.toFixed(1)}${DEG}`;
};

const formatDistance = (v: number | null | undefined, decimals = 1): string => {
  if (v == null || !Number.isFinite(v) || v === Infinity) return "-";
  return v.toFixed(decimals);
};

type InfoCardProps = {
  labelKey: string;
  value: string;
};

const InfoCard = ({ labelKey, value }: InfoCardProps) => {
  const theme = useTheme();
  const containerStyle = useMemo(
    () => [styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }],
    [theme],
  );

  return (
    <VView style={containerStyle}>
      <Text
        textKey={labelKey}
        variant="labelSmall"
        style={styles.infoCardLabel}
      />
      <Text variant="titleMedium" style={styles.infoCardValue}>
        {value}
      </Text>
    </VView>
  );
};

const headingSourceButtons = [
  {
    value: "magnetometer",
    label: "dataEntry:coordinate.headingSourceMagnetometer",
    icon: "compass",
  },
  {
    value: "location",
    label: "dataEntry:coordinate.headingSourceLocation",
    icon: "crosshairs-gps",
  },
];

const viewModeButtons = [
  {
    value: "compass",
    label: "dataEntry:coordinate.viewModeCompass",
    icon: "compass-outline",
  },
  {
    value: "radar",
    label: "dataEntry:coordinate.viewModeRadar",
    icon: "radar",
  },
];

const determineWarningKey = (
  headingSourceAvailable: boolean,
  headingSource: string,
) => {
  if (headingSourceAvailable) {
    return null;
  }
  return headingSource === "magnetometer"
    ? "dataEntry:coordinate.magnetometerNotAvailable"
    : "dataEntry:coordinate.locationHeadingNotAvailable";
};

type LocationNavigatorProps = {
  targetPoint: any;
  onDismiss: () => void;
  onUseCurrentLocation: (location: any) => void;
};

export const LocationNavigator = (props: LocationNavigatorProps) => {
  const { targetPoint, onDismiss, onUseCurrentLocation } = props;

  const minDimension = useMinScreenDimension();
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();
  const size = isLandscape ? minDimension - 110 : minDimension - 60;

  const [viewMode, setViewMode] = useState<"compass" | "radar">("compass");
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);

  const {
    accuracy,
    angleToTarget,
    arrowColor,
    currentCoordDisplay,
    currentLocation,
    distance,
    heading,
    headingSource,
    headingSourceAvailable,
    isProximity,
    onUseCurrentLocationPress,
    relativeAngle,
    setHeadingSource,
    targetCoordDisplay,
  } = useLocationNavigator({ targetPoint, onDismiss, onUseCurrentLocation });

  const { compassRotStyle, arrowRotStyle } = useCompassAnimation({
    heading,
    relativeAngle,
  });

  const navigatorContainerStyle = useMemo(
    () => ({ width: size, height: size }),
    [size],
  );

  const compassView = (
    <VView style={navigatorContainerStyle}>
      <CompassRose compassRotStyle={compassRotStyle} size={size} />
      {!currentLocation && loadingOverlay}
      {currentLocation && !isProximity && (
        <>
          <NavigatorArrow
            arrowRotStyle={arrowRotStyle}
            arrowColor={arrowColor}
            size={size}
          />
          <CenterCross size={size} />
        </>
      )}
      {currentLocation && isProximity && (
        <>
          <AccuracyCircle size={size} accuracy={accuracy} />
          <CenterCross size={size} />
          <TargetPointDot
            size={size}
            angle={relativeAngle}
            distance={distance}
          />
        </>
      )}
    </VView>
  );

  const radarView = (
    <VView style={navigatorContainerStyle}>
      <RadarView
        size={size}
        relativeAngle={relativeAngle}
        distance={distance}
        heading={heading}
        accuracy={accuracy}
      />
      {!currentLocation && loadingOverlay}
      {currentLocation && <CenterCross size={size} />}
    </VView>
  );

  const compass = viewMode === "compass" ? compassView : radarView;

  const infoCards = (
    <FlexWrapView style={styles.cardsRow}>
      <InfoCard
        labelKey="dataEntry:coordinate.distance"
        value={formatDistance(distance, 0)}
      />
      <InfoCard
        labelKey="dataEntry:coordinate.heading"
        value={formatAngle(heading)}
      />
      <InfoCard
        labelKey="dataEntry:coordinate.angleToTargetLocation"
        value={formatAngle(angleToTarget)}
      />
      <InfoCard
        labelKey="dataEntry:coordinate.accuracy"
        value={formatDistance(accuracy)}
      />
    </FlexWrapView>
  );

  const coords = (
    <VView style={styles.coordsSection}>
      {targetCoordDisplay && (
        <FormItem
          labelKey="dataEntry:coordinate.targetLocation"
          labelIcon={<TargetLocationIcon size={18} />}
        >
          {targetCoordDisplay}
        </FormItem>
      )}
      <FormItem
        labelKey="dataEntry:coordinate.currentLocation"
        labelIcon={<CurrentLocationIcon size={18} />}
      >
        {currentCoordDisplay}
      </FormItem>
    </VView>
  );

  const actionButton = (
    <HView style={styles.buttonRow}>
      <Button
        disabled={!currentLocation}
        onPress={onUseCurrentLocationPress}
        textKey="dataEntry:coordinate.useCurrentLocation"
      />
    </HView>
  );

  const headingSourceSwitch = (
    <HView style={styles.headingSourceRow}>
      <SegmentedButtons
        style={styles.headingSourceButtons}
        buttons={headingSourceButtons}
        value={headingSource}
        onChange={(v) => setHeadingSource(v as typeof headingSource)}
      />
      <IconButton
        icon="information-outline"
        mode="contained-tonal"
        size={16}
        onPress={() => setInfoDialogVisible(true)}
      />
    </HView>
  );

  const viewModeSwitch = (
    <SegmentedButtons
      buttons={viewModeButtons}
      value={viewMode}
      onChange={(v) => setViewMode(v as typeof viewMode)}
    />
  );

  const warningKey = determineWarningKey(headingSourceAvailable, headingSource);

  const warning = warningKey ? (
    <Text textKey={warningKey} variant="labelMedium" style={styles.warning} />
  ) : null;

  const infoDialog = infoDialogVisible ? (
    <LocationNavigatorInfoDialog onClose={() => setInfoDialogVisible(false)} />
  ) : null;

  if (isLandscape) {
    return (
      <Modal
        onDismiss={onDismiss}
        titleKey="dataEntry:coordinate.navigateToTarget"
      >
        {infoDialog}
        <HView style={styles.containerLandscape}>
          {/* Left column: compass */}
          <VView style={styles.compassColumnLandscape}>{compass}</VView>

          {/* Right column: info panel */}
          <ScrollView style={styles.infoColumnLandscape}>
            <VView style={styles.infoColumnContent}>
              {viewModeSwitch}
              {headingSourceSwitch}
              {warning}
              {infoCards}
              {coords}
              {actionButton}
            </VView>
          </ScrollView>
        </HView>
      </Modal>
    );
  }

  return (
    <Modal
      onDismiss={onDismiss}
      titleKey="dataEntry:coordinate.navigateToTarget"
    >
      {infoDialog}
      <ScrollView>
        <VView style={styles.container}>
          {viewModeSwitch}
          {headingSourceSwitch}
          {warning}
          <VView style={styles.compassWrapper}>{compass}</VView>
          {infoCards}
          {coords}
          {actionButton}
        </VView>
      </ScrollView>
    </Modal>
  );
};

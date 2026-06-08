import { useMemo } from "react";
import { useTheme } from "react-native-paper";

import {
  Button,
  FlexWrapView,
  FormItem,
  HView,
  Modal,
  ScrollView,
  Text,
  VView,
} from "components";
import { useMinScreenDimension } from "hooks";
import { DeviceInfoSelectors } from "state";

import { CompassRose } from "./CompassRose";
import { NavigatorArrow } from "./NavigatorArrow";
import { ProximityDot } from "./ProximityDot";
import styles from "./styles";
import { useCompassAnimation } from "./useCompassAnimation";
import { useLocationNavigator } from "./useLocationNavigator";

const DEG = "°";

const formatAngle = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "-";
  return `${v.toFixed(1)}${DEG}`;
};

const formatDistance = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v) || v === Infinity) return "-";
  return `${v.toFixed(1)} m`;
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

  const {
    accuracy,
    angleToTarget,
    arrowColor,
    currentCoordDisplay,
    currentLocation,
    distance,
    heading,
    isProximity,
    magnetometerAvailable,
    onUseCurrentLocationPress,
    relativeAngle,
    targetCoordDisplay,
  } = useLocationNavigator({ targetPoint, onDismiss, onUseCurrentLocation });

  const { compassRotStyle, arrowRotStyle } = useCompassAnimation({
    heading,
    relativeAngle,
  });

  const compass = (
    <VView style={{ width: size, height: size }}>
      <CompassRose compassRotStyle={compassRotStyle} size={size} />
      <NavigatorArrow
        arrowRotStyle={arrowRotStyle}
        arrowColor={arrowColor}
        size={size}
      />
      {isProximity && (
        <ProximityDot
          size={size}
          angle={angleToTarget}
          compassRotStyle={compassRotStyle}
        />
      )}
    </VView>
  );

  const infoCards = (
    <FlexWrapView style={styles.cardsRow}>
      <InfoCard
        labelKey="dataEntry:coordinate.distance"
        value={formatDistance(distance)}
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
        <FormItem labelKey="dataEntry:coordinate.targetLocation">
          {targetCoordDisplay}
        </FormItem>
      )}
      <FormItem labelKey="dataEntry:coordinate.currentLocation">
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

  const warning = magnetometerAvailable ? null : (
    <Text
      textKey="dataEntry:coordinate.magnetometerNotAvailable"
      variant="labelMedium"
      style={styles.warning}
    />
  );

  if (isLandscape) {
    return (
      <Modal
        onDismiss={onDismiss}
        titleKey="dataEntry:coordinate.navigateToTarget"
      >
        <HView style={styles.containerLandscape}>
          {/* Left column: compass */}
          <VView style={styles.compassColumnLandscape}>{compass}</VView>

          {/* Right column: info panel */}
          <ScrollView style={styles.infoColumnLandscape}>
            <VView style={styles.infoColumnContent}>
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
      <ScrollView>
        <VView style={styles.container}>
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

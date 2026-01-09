import React from "react";

import { UpdateStatus } from "model";

import { IconButton } from "../IconButton";

import styles from "./styles";

const iconByUpdateStatus: Record<UpdateStatus, string> = {
  [UpdateStatus.loading]: "loading",
  [UpdateStatus.upToDate]: "check",
  [UpdateStatus.networkNotAvailable]: "alert",
  [UpdateStatus.notUpToDate]: "alert",
  [UpdateStatus.error]: "alert-circle",
};

type Props = {
  loading?: boolean;
  onPress: () => void;
  updateStatus: UpdateStatus;
};

export const UpdateStatusIcon = ({ loading, updateStatus, onPress }: Props) => {
  const icon = loading
    ? "loading"
    : (iconByUpdateStatus[updateStatus] ?? "alert");

  return (
    <IconButton
      disabled={loading}
      icon={icon}
      style={styles.updateStatusIconButton}
      onPress={onPress}
    />
  );
};

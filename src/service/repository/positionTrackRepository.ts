import { Dates } from "@openforis/arena-core";

import { dbClient } from "db";
import { TrackPoint, TrackSegment } from "model";

export enum PositionTrackStatus {
  tracking = "tracking",
  paused = "paused",
}

export type PositionTrack = {
  id: number;
  surveyId: number;
  recordUuid: string;
  nodeUuid: string;
  status: PositionTrackStatus;
  // node value when the track was started: the recorded segments are appended to it
  baseValue: any;
};

const rowToTrack = (row: any): PositionTrack => ({
  id: row.id,
  surveyId: row.survey_id,
  recordUuid: row.record_uuid,
  nodeUuid: row.node_uuid,
  status: row.status,
  baseValue: row.base_value ? JSON.parse(row.base_value) : null,
});

const insertTrack = async ({
  surveyId,
  recordUuid,
  nodeUuid,
  baseValue,
}: Omit<PositionTrack, "id" | "status">): Promise<PositionTrack> => {
  const now = Dates.nowFormattedForStorage();
  const status = PositionTrackStatus.tracking;
  const { insertId } = await dbClient.runSql(
    `INSERT INTO position_track (survey_id, record_uuid, node_uuid, status, base_value, date_created, date_modified)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      surveyId,
      recordUuid,
      nodeUuid,
      status,
      baseValue ? JSON.stringify(baseValue) : null,
      now,
      now,
    ],
  );
  return { id: insertId, surveyId, recordUuid, nodeUuid, status, baseValue };
};

const fetchTrackByRecordUuid = async (
  recordUuid: string,
): Promise<PositionTrack | null> => {
  const row = await dbClient.one(
    `SELECT * FROM position_track WHERE record_uuid = ? ORDER BY id DESC`,
    [recordUuid],
  );
  return row ? rowToTrack(row) : null;
};

const updateTrackStatus = async ({
  id,
  status,
}: {
  id: number;
  status: PositionTrackStatus;
}) => {
  await dbClient.runSql(
    `UPDATE position_track SET status = ?, date_modified = ? WHERE id = ?`,
    [status, Dates.nowFormattedForStorage(), id],
  );
};

const insertPoint = async ({
  trackId,
  segmentIndex,
  point,
}: {
  trackId: number;
  segmentIndex: number;
  point: TrackPoint;
}) => {
  const { time, latitude, longitude, altitude, accuracy } = point;
  await dbClient.runSql(
    `INSERT INTO position_track_point (track_id, segment_index, time, latitude, longitude, altitude, accuracy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      trackId,
      segmentIndex,
      time,
      latitude,
      longitude,
      altitude ?? null,
      accuracy ?? null,
    ],
  );
};

const fetchSegments = async (trackId: number): Promise<TrackSegment[]> => {
  const rows: any[] = await dbClient.many(
    `SELECT segment_index, time, latitude, longitude, altitude, accuracy
     FROM position_track_point
     WHERE track_id = ?
     ORDER BY segment_index, id`,
    [trackId],
  );
  const segmentsByIndex = new Map<number, TrackSegment>();
  for (const row of rows) {
    let segment = segmentsByIndex.get(row.segment_index);
    if (!segment) {
      segment = [];
      segmentsByIndex.set(row.segment_index, segment);
    }
    segment.push({
      time: row.time,
      latitude: row.latitude,
      longitude: row.longitude,
      altitude: row.altitude,
      accuracy: row.accuracy,
    });
  }
  return [...segmentsByIndex.values()];
};

const deleteTracksByIds = async (ids: number[]) => {
  if (ids.length === 0) return;
  const idsJoint = ids.join(", ");
  await dbClient.transaction(async () => {
    await dbClient.runSql(
      `DELETE FROM position_track_point WHERE track_id IN (${idsJoint})`,
    );
    await dbClient.runSql(`DELETE FROM position_track WHERE id IN (${idsJoint})`);
  });
};

const deleteTrack = (id: number) => deleteTracksByIds([id]);

const deleteTracksByRecordUuids = async (recordUuids: string[]) => {
  if (recordUuids.length === 0) return;
  const rows: any[] = await dbClient.many(
    `SELECT id FROM position_track WHERE record_uuid IN (${recordUuids.map(() => "?").join(", ")})`,
    recordUuids,
  );
  await deleteTracksByIds(rows.map((row) => row.id));
};

export const PositionTrackRepository = {
  insertTrack,
  fetchTrackByRecordUuid,
  updateTrackStatus,
  insertPoint,
  fetchSegments,
  deleteTrack,
  deleteTracksByRecordUuids,
};

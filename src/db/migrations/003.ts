import SQLiteClient from "db/SQLiteClient";

export const migration_003_position_track = async (dbClient: SQLiteClient) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(`CREATE TABLE IF NOT EXISTS position_track (
        id              INTEGER       PRIMARY KEY AUTOINCREMENT,
        survey_id       INTEGER       NOT NULL,
        record_uuid     CHAR(16)      NOT NULL,
        node_uuid       CHAR(16)      NOT NULL,
        status          VARCHAR(16)   NOT NULL,
        base_value      TEXT,
        date_created    TIMESTAMP     NOT NULL,
        date_modified   TIMESTAMP     NOT NULL
    );`);

    await dbClient.executeSql(`CREATE TABLE IF NOT EXISTS position_track_point (
        id              INTEGER       PRIMARY KEY AUTOINCREMENT,
        track_id        INTEGER       NOT NULL,
        segment_index   INTEGER       NOT NULL,
        time            INTEGER       NOT NULL,
        latitude        REAL          NOT NULL,
        longitude       REAL          NOT NULL,
        altitude        REAL,
        accuracy        REAL,

        CONSTRAINT fk_track_id
          FOREIGN KEY (track_id)
          REFERENCES position_track (id)
          ON DELETE CASCADE
    );`);

    await dbClient.executeSql(
      `CREATE INDEX IF NOT EXISTS position_track_point_track_id_idx ON position_track_point (track_id);`,
    );
  });
};

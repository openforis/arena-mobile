export const migration_001_base = async (dbClient) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(`CREATE TABLE IF NOT EXISTS survey (
        id          INTEGER         PRIMARY KEY AUTOINCREMENT,
        uuid        CHAR(16)        NOT NULL,
        server_url  VARCHAR(255),
        remote_id   INTEGER,
        name        VARCHAR(255)    NOT NULL,
        label       VARCHAR(255),
        content     TEXT            NOT NULL,
        date_created    TIMESTAMP   NOT NULL,
        date_modified   TIMESTAMP   NOT NULL
    );`);

    await dbClient.executeSql(`CREATE TABLE IF NOT EXISTS record (
        id              INTEGER       PRIMARY KEY AUTOINCREMENT,
        uuid            CHAR(16)      NOT NULL,
        survey_id       INTEGER       NOT NULL,
        cycle           VARCHAR(3),
        origin          CHAR(1)       NOT NULL DEFAULT 'L',
        load_status     CHAR(1)       NOT NULL DEFAULT 'C',
        merged_into_record_uuid CHAR(16),
        content         TEXT          NOT NULL,
        key1            TEXT,
        key2            TEXT,
        key3            TEXT,
        key4            TEXT,
        key5            TEXT,
        owner_uuid      CHAR(16),
        owner_name      VARCHAR(255),
        date_created    TIMESTAMP     NOT NULL,
        date_modified   TIMESTAMP     NOT NULL,
        date_modified_remote TIMESTAMP,
        date_synced     TIMESTAMP,

        CONSTRAINT fk_survey_id
          FOREIGN KEY (survey_id)
          REFERENCES survey (id)
    );`);
  });
};

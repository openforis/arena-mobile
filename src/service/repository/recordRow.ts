import { RecordLoadStatus, RecordOrigin } from "model";

export type RecordKeyOrSummaryColumn = `key${number}` | `summary${number}`;

// row of the record table (snake_case columns): only the selected columns are set
export type RecordRow = {
  id: number;
  uuid: string;
  survey_id?: number;
  content?: string | null;
  fixed_for?: string | null;
  date_created?: string | null;
  date_modified?: string | null;
  date_modified_remote?: string | null;
  date_modified_synced?: string | null;
  date_synced?: string | null;
  cycle?: string | null;
  owner_uuid?: string | null;
  owner_name?: string | null;
  load_status?: RecordLoadStatus;
  origin?: RecordOrigin;
  read_only?: number | null;
  merged_into_record_uuid?: string | null;
  errors_count?: number | null;
  warnings_count?: number | null;
} & { [col in RecordKeyOrSummaryColumn]?: string | null };

import LZString from "lz-string";

import { Objects, Survey, Surveys } from "@openforis/arena-core";

import { DbUtils, dbClient } from "db";
import { SurveyMobile } from "model";

type SurveyRow = {
  id: number;
  server_url: string;
  remote_id: number;
  uuid: string;
  name: string;
  label: string | null;
  content: string;
  date_created: string;
  date_modified: string;
};

const getSurveyLabel = (survey: Survey) =>
  Surveys.getLabel(Surveys.getDefaultLanguage(survey))(survey);

const insertSurvey = async (survey: Survey): Promise<SurveyMobile> => {
  const { id, uuid, dateCreated, datePublished, dateModified } = survey;
  const surveyMobile = survey as SurveyMobile;
  const name = Surveys.getName(survey);
  const label = getSurveyLabel(survey);
  const { insertId } = await dbClient.runSql(
    `INSERT INTO survey (server_url, remote_id, uuid, name, label, content, date_created, date_modified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      surveyMobile.serverUrl || "localhost",
      id,
      uuid,
      name,
      label,
      "", // always save empty content (stored in FS)
      dateCreated,
      datePublished ?? dateModified,
    ],
  );
  surveyMobile.remoteId = id!;
  surveyMobile.id = insertId;
  return surveyMobile;
};

const updateSurvey = async ({
  id,
  survey,
}: {
  id: number;
  survey: Survey;
}): Promise<SurveyMobile> => {
  const surveyMobile = survey as SurveyMobile;
  await dbClient.runSql(
    `UPDATE survey SET name = ?, label = ?, content = ?, date_created = ?, date_modified = ?
     WHERE id = ?`,
    [
      survey.props.name,
      getSurveyLabel(survey),
      "", // always set content to empty (stored in FS)
      survey.dateCreated,
      survey.datePublished ?? survey.dateModified,
      id,
    ],
  );
  surveyMobile.remoteId = survey.id!;
  surveyMobile.id = id;
  return surveyMobile;
};

const fetchSurveyById = async (id: number) => {
  const row = await dbClient.one<Pick<SurveyRow, "remote_id" | "content">>(
    "SELECT remote_id, content FROM survey WHERE id = ?",
    [id],
  );
  const { content, remote_id: remoteId } = row!;
  const survey = Objects.isEmpty(content)
    ? {}
    : JSON.parse(LZString.decompressFromBase64(content));
  survey.id = id;
  survey.remoteId = remoteId;
  return survey;
};

const fetchSurveySummaries = async () => {
  const surveys = await dbClient.many<
    Omit<SurveyRow, "content" | "date_created">
  >(
    `SELECT id, server_url, remote_id, uuid, name, label, date_modified
    FROM survey
    ORDER BY name`,
  );
  return surveys.map((survey) => Objects.camelize(survey));
};

// foreign keys are not enforced: dependent rows are deleted explicitly
const deleteSurveys = async (surveyIds: number[]) => {
  if (surveyIds.length === 0) return;
  const ids = DbUtils.placeholders(surveyIds);
  await dbClient.transaction(async (tx) => {
    await tx.runSql(
      `DELETE FROM position_track_point WHERE track_id IN
        (SELECT id FROM position_track WHERE survey_id IN (${ids}))`,
      surveyIds,
    );
    await tx.runSql(
      `DELETE FROM position_track WHERE survey_id IN (${ids})`,
      surveyIds,
    );
    await tx.runSql(
      `DELETE FROM record WHERE survey_id IN (${ids})`,
      surveyIds,
    );
    await tx.runSql(`DELETE FROM survey WHERE id IN (${ids})`, surveyIds);
  });
};

export const SurveyRepository = {
  fetchSurveyById,
  fetchSurveySummaries,
  insertSurvey,
  updateSurvey,
  deleteSurveys,
};

import LZString from "lz-string";

import { Objects, Survey, Surveys } from "@openforis/arena-core";

import { DbUtils, dbClient } from "db";
import { SurveyMobile } from "model";

const insertSurvey = async (survey: Survey): Promise<SurveyMobile> => {
  const { id, uuid, dateCreated, datePublished, dateModified } = survey;
  const surveyMobile = survey as SurveyMobile;
  const name = Surveys.getName(survey);
  const defaultLang = Surveys.getDefaultLanguage(survey);
  const label = Surveys.getLabel(defaultLang)(survey);
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

const updateSurvey = async ({ id, survey }: any) => {
  await dbClient.runSql(
    `UPDATE survey SET name = ?, label = ?, content = ?, date_created = ?, date_modified = ?
     WHERE id = ?`,
    [
      survey.props.name,
      survey.props.labels?.["en"],
      "", // always set content to empty (stored in FS)
      survey.dateCreated,
      survey.datePublished ?? survey.dateModified,
      id,
    ],
  );
  survey.remoteId = survey.id;
  survey.id = id;
  return survey;
};

const fetchSurveyById = async (id: any) => {
  const row: any = await dbClient.one(
    "SELECT remote_id, content FROM survey WHERE id = ?",
    [id],
  );
  const { content, remote_id: remoteId } = row;
  const survey = Objects.isEmpty(content)
    ? {}
    : JSON.parse(LZString.decompressFromBase64(content));
  survey.id = id;
  survey.remoteId = remoteId;
  return survey;
};

const fetchSurveySummaries = async () => {
  const surveys = await dbClient.many(
    `SELECT id, server_url, remote_id, uuid, name, label, date_modified
    FROM survey
    ORDER BY name`,
  );
  return surveys.map((survey: any) => Objects.camelize(survey));
};

const deleteSurveys = async (surveyIds: any) => {
  await dbClient.runSql(
    `DELETE FROM survey WHERE id IN (${DbUtils.quoteValues(surveyIds)})`,
  );
};

export const SurveyRepository = {
  fetchSurveyById,
  fetchSurveySummaries,
  insertSurvey,
  updateSurvey,
  deleteSurveys,
};

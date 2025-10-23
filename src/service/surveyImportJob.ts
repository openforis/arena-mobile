// @ts-expect-error TS(2307): Cannot find module 'model/JobMobile' or its corres... Remove this comment to see the full error message
import { JobMobile } from "model/JobMobile";
import { SurveyService } from "./surveyService";

class SurveyDownloadJob extends JobMobile {
  context: any;
  async execute() {
    const { id } = this.context;
    await SurveyService.fetchSurveyRemoteById({ id });
  }
}

export class SurveyImportJob extends JobMobile {
  jobs: any;
  constructor({
    id,
    user
  }: any) {
    super({ id });

    // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
    this.jobs = [new SurveyDownloadJob({ id })];
  }
}

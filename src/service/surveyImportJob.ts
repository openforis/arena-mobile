import { JobMobile } from "model/JobMobile";
import { SurveyService } from "./surveyService";

class SurveyDownloadJob extends JobMobile {
  async execute() {
    const { id } = this.context;
    await SurveyService.fetchSurveyRemoteById({ id });
  }
}

// @ts-ignore
export class SurveyImportJob extends JobMobile {
  constructor({ id, user }: any) {
    super({ id, user });
    this.jobs = [new SurveyDownloadJob({ id })];
  }
}

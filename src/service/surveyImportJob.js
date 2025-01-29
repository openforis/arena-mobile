import { JobMobile } from "model/JobMobile";
import { SurveyService } from "./surveyService";

class SurveyDownloadJob extends JobMobile {
  async execute() {
    const { id } = this.context;
    await SurveyService.fetchSurveyRemoteById({ id });
  }
}

export class SurveyImportJob extends JobMobile {
  constructor({ id, user }) {
    super({ id });

    this.jobs = [new SurveyDownloadJob({ id })];
  }
}

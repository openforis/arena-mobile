import { User } from "@openforis/arena-core";

import { JobMobile } from "model/JobMobile";
import { SurveyService } from "./surveyService";

type SurveyImportJobContext = {
  id: number;
  user: User;
};

class SurveyDownloadJob extends JobMobile<SurveyImportJobContext> {
  async execute() {
    const { id } = this.context;
    await SurveyService.fetchSurveyRemoteById({ id });
  }
}

export class SurveyImportJob extends JobMobile<SurveyImportJobContext> {
  constructor({ id, user }: any) {
    super({ id, user });
    this.jobs = [new SurveyDownloadJob({ id, user })];
  }

  protected override execute(): Promise<void> {
    return Promise.resolve();
  }
}

import { JobMobile } from "model/JobMobile";
import { SurveyService } from "./surveyService";

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
class SurveyDownloadJob extends JobMobile {
  context: any;
  async execute() {
    const { id } = this.context;
    await SurveyService.fetchSurveyRemoteById({ id });
  }
}

// @ts-expect-error TS(2507): Type 'typeof JobMobile' is not a constructor funct... Remove this comment to see the full error message
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
